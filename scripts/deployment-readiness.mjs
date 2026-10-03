import { spawnSync } from "node:child_process";

const databases = {
  preview: "woodhouse-emdash-preview",
  production: "woodhouse-emdash"
};

function quoteSql(value) {
  return "'" + String(value).replaceAll("'", "''") + "'";
}

function parseJsonOutput(output) {
  const offset = output.search(/\[|[{]/);
  if (offset < 0) throw new Error("D1 readiness query did not return JSON.");
  return JSON.parse(output.slice(offset));
}

function query(database, sql) {
  const result = spawnSync(
    "pnpm",
    ["exec", "wrangler", "d1", "execute", database, "--remote", "--json", "--command", sql],
    {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024
    }
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error("Cloudflare D1 readiness query failed.");
  const parsed = parseJsonOutput(result.stdout);
  const batches = Array.isArray(parsed) ? parsed : [parsed];
  return batches.flatMap((batch) => batch.results ?? []);
}

function publicSlugs(seed, collection) {
  return (seed.content[collection] ?? [])
    .filter((entry) => entry.status === "published" && entry.data?.public_safe === true)
    .map((entry) => entry.slug);
}

function slugList(slugs) {
  return slugs.length ? slugs.map(quoteSql).join(",") : "''";
}

function sqliteTable(collectionSlug) {
  if (!/^[a-z][a-z0-9_]*$/.test(collectionSlug))
    throw new Error("Invalid collection slug in deployment seed.");
  return `ec_${collectionSlug}`;
}

function expectedSeedReferences(seed) {
  const entriesById = new Map();
  for (const collection of seed.collections) {
    entriesById.set(
      collection.slug,
      new Map((seed.content[collection.slug] ?? []).map((entry) => [entry.id, entry]))
    );
  }

  return seed.relations.map((relation) => {
    const fields = (
      seed.collections.find((collection) => collection.slug === relation.parentCollection)
        ?.fields ?? []
    ).filter((field) => field.type === "reference" && field.validation?.relation === relation.slug);
    if (fields.length !== 1)
      throw new Error(`Expected exactly one seed reference field for ${relation.slug}.`);
    const field = fields[0];
    if (field.validation?.targetCollection !== relation.childCollection)
      throw new Error(`Seed reference target differs for ${relation.slug}.`);

    const parents = (seed.content[relation.parentCollection] ?? []).filter(
      (entry) => entry.status === "published" && entry.data?.public_safe === true
    );
    const expected = new Set();
    for (const parent of parents) {
      const raw = parent.data?.[field.slug];
      const references = raw == null ? [] : Array.isArray(raw) ? raw : [raw];
      for (const reference of references) {
        if (typeof reference !== "string" || !reference.startsWith("$ref:")) {
          throw new Error(
            `Seed reference ${relation.slug} on ${parent.slug} must use a $ref: value.`
          );
        }
        const childId = reference.slice("$ref:".length);
        const child = entriesById.get(relation.childCollection)?.get(childId);
        if (!child || child.status !== "published" || child.data?.public_safe !== true) {
          throw new Error(
            `Seed reference ${relation.slug} on ${parent.slug} targets a missing or non-public record.`
          );
        }
        expected.add(`${parent.slug}\u0000${child.slug}`);
      }
    }
    return { relation, parents, expected };
  });
}

function verifySeedReferences(database, seed) {
  const mismatches = [];
  let verifiedRelations = 0;
  for (const { relation, parents, expected } of expectedSeedReferences(seed)) {
    const parentSlugs = parents.map((entry) => entry.slug);
    const parentTable = sqliteTable(relation.parentCollection);
    const childTable = sqliteTable(relation.childCollection);
    const sql = [
      "SELECT p.slug AS parent_slug,c.slug AS child_slug",
      "FROM _emdash_content_references r",
      "JOIN _emdash_relations rel ON rel.id=r.relation_id",
      `JOIN ${parentTable} p ON p.id=r.parent_group`,
      `JOIN ${childTable} c ON c.id=r.child_group`,
      "WHERE rel.slug=" + quoteSql(relation.slug),
      "AND p.slug IN (" + slugList(parentSlugs) + ")"
    ].join(" ");
    const actual = new Set(
      query(database, sql).map((row) => `${row.parent_slug}\u0000${row.child_slug}`)
    );
    for (const edge of expected)
      if (!actual.has(edge)) mismatches.push(`${relation.slug}:${edge.replace("\u0000", "->")}`);
    for (const edge of actual)
      if (!expected.has(edge))
        mismatches.push(`${relation.slug}:${edge.replace("\u0000", "->")} (unexpected)`);
    verifiedRelations += 1;
  }
  return { mismatches, verifiedRelations };
}

function publicContentQuery(seed) {
  const projects = publicSlugs(seed, "projects");
  const snapshots = publicSlugs(seed, "factory_snapshots");
  const statuses = publicSlugs(seed, "project_statuses");
  const evidence = publicSlugs(seed, "evidence_records");
  const dispatches = publicSlugs(seed, "dispatches");
  const incidents = publicSlugs(seed, "incidents");
  const projectList = slugList(projects);
  const snapshotList = slugList(snapshots);
  const dispatchList = slugList(dispatches);
  const sql = [
    "SELECT",
    "(SELECT COUNT(DISTINCT slug) FROM ec_projects WHERE slug IN (" +
      projectList +
      ") AND status='published' AND deleted_at IS NULL AND public_safe=1 AND title<>'' AND summary<>'') AS projects,",
    "(SELECT COUNT(DISTINCT slug) FROM ec_factory_snapshots WHERE slug IN (" +
      snapshotList +
      ") AND status='published' AND deleted_at IS NULL AND public_safe=1 AND title<>'' AND reviewed_at<>'' AND source_description<>'' AND scope<>'') AS snapshots,",
    "(SELECT COUNT(DISTINCT s.slug) FROM ec_project_statuses s WHERE s.slug IN (" +
      slugList(statuses) +
      ") AND s.status='published' AND s.deleted_at IS NULL AND s.public_safe=1 AND s.state<>'' AND s.current<>'' AND s.next_proof<>'' AND s.proof_boundary<>'' AND s.reviewed_at<>'' AND EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id=r.relation_id JOIN ec_projects p ON p.id=r.child_group WHERE rel.slug='project_statuses_project' AND r.parent_group=s.id AND p.status='published' AND p.deleted_at IS NULL AND p.public_safe=1 AND p.slug IN (" +
      projectList +
      ")) AND EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id=r.relation_id JOIN ec_factory_snapshots f ON f.id=r.child_group WHERE rel.slug='project_statuses_snapshot' AND r.parent_group=s.id AND f.status='published' AND f.deleted_at IS NULL AND f.public_safe=1 AND f.slug IN (" +
      snapshotList +
      "))) AS statuses,",
    "(SELECT COUNT(DISTINCT e.slug) FROM ec_evidence_records e WHERE e.slug IN (" +
      slugList(evidence) +
      ") AND e.status='published' AND e.deleted_at IS NULL AND e.public_safe=1 AND e.title<>'' AND e.claim<>'' AND e.evidence_kind<>'' AND e.reviewed_at<>'' AND e.proof_boundary<>'' AND EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id=r.relation_id JOIN ec_projects p ON p.id=r.child_group WHERE rel.slug='evidence_records_project' AND r.parent_group=e.id AND p.status='published' AND p.deleted_at IS NULL AND p.public_safe=1 AND p.slug IN (" +
      projectList +
      ")) AND EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id=r.relation_id JOIN ec_factory_snapshots f ON f.id=r.child_group WHERE rel.slug='evidence_records_snapshot' AND r.parent_group=e.id AND f.status='published' AND f.deleted_at IS NULL AND f.public_safe=1 AND f.slug IN (" +
      snapshotList +
      "))) AS evidence,",
    "(SELECT COUNT(DISTINCT slug) FROM ec_dispatches WHERE slug IN (" +
      dispatchList +
      ") AND status='published' AND deleted_at IS NULL AND public_safe=1 AND title<>'' AND kind<>'' AND deck<>'' AND review_date<>'' AND source_reference<>'' AND lead<>'' AND lesson<>'') AS dispatches,",
    "(SELECT COUNT(DISTINCT i.slug) FROM ec_incidents i WHERE i.slug IN (" +
      slugList(incidents) +
      ") AND i.status='published' AND i.deleted_at IS NULL AND i.public_safe=1 AND i.title<>'' AND i.initial_belief<>'' AND i.what_happened<>'' AND i.evidence<>'' AND i.root_cause<>'' AND i.factory_change<>'' AND i.reviewed_at<>'' AND i.proof_boundary<>'' AND EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id=r.relation_id JOIN ec_projects p ON p.id=r.child_group WHERE rel.slug='incidents_project' AND r.parent_group=i.id AND p.status='published' AND p.deleted_at IS NULL AND p.public_safe=1 AND p.slug IN (" +
      projectList +
      ")) AND EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id=r.relation_id JOIN ec_factory_snapshots f ON f.id=r.child_group WHERE rel.slug='incidents_snapshot' AND r.parent_group=i.id AND f.status='published' AND f.deleted_at IS NULL AND f.public_safe=1 AND f.slug IN (" +
      snapshotList +
      ")) AND EXISTS (SELECT 1 FROM _emdash_content_references r JOIN _emdash_relations rel ON rel.id=r.relation_id JOIN ec_dispatches d ON d.id=r.child_group WHERE rel.slug='incidents_dispatch' AND r.parent_group=i.id AND d.status='published' AND d.deleted_at IS NULL AND d.public_safe=1 AND d.slug IN (" +
      dispatchList +
      "))) AS incidents"
  ].join(" ");
  return {
    sql,
    expected: {
      projects: projects.length,
      snapshots: snapshots.length,
      statuses: statuses.length,
      evidence: evidence.length,
      dispatches: dispatches.length,
      incidents: incidents.length
    }
  };
}

export function verifyDatabaseReadiness(database, seed) {
  const collectionSlugs = seed.collections.map((collection) => collection.slug);
  const liveCollections = query(
    database,
    "SELECT slug FROM _emdash_collections WHERE slug IN (" +
      collectionSlugs.map(quoteSql).join(",") +
      ") ORDER BY slug"
  );
  const collectionSet = new Set(liveCollections.map((row) => row.slug));

  const liveFields = query(
    database,
    'SELECT c.slug AS collection_slug,f.slug AS field_slug,f.type,f.required,f.default_value,f.validation,f.searchable,f."unique" AS unique_field,f.indexed FROM _emdash_collections c JOIN _emdash_fields f ON f.collection_id=c.id WHERE c.slug IN (' +
      collectionSlugs.map(quoteSql).join(",") +
      ") ORDER BY c.slug,f.slug"
  );
  const actualFields = new Map(
    liveFields.map((field) => [field.collection_slug + "/" + field.field_slug, field])
  );
  const expectedFields = seed.collections.flatMap((collection) =>
    collection.fields.map((field) => ({ collection, field }))
  );
  const fieldMatches = ({ collection, field }) => {
    const actual = actualFields.get(collection.slug + "/" + field.slug);
    if (
      !actual ||
      actual.type !== field.type ||
      Number(actual.required) !== Number(field.required === true)
    )
      return false;
    const expectedDefault = Object.hasOwn(field, "defaultValue")
      ? JSON.stringify(field.defaultValue)
      : null;
    if ((actual.default_value ?? null) !== expectedDefault) return false;
    if (
      Object.hasOwn(field, "searchable") &&
      Number(actual.searchable) !== Number(field.searchable === true)
    )
      return false;
    if (
      Object.hasOwn(field, "unique") &&
      Number(actual.unique_field) !== Number(field.unique === true)
    )
      return false;
    if (
      Object.hasOwn(field, "indexed") &&
      Number(actual.indexed) !== Number(field.indexed === true)
    )
      return false;
    if (field.validation) {
      let validation;
      try {
        validation = JSON.parse(actual.validation ?? "{}");
      } catch {
        return false;
      }
      if (
        Object.entries(field.validation).some(
          ([key, value]) => JSON.stringify(validation[key]) !== JSON.stringify(value)
        )
      )
        return false;
      if (field.type === "reference" && validation.relationSide !== "parent") return false;
    }
    return true;
  };
  const fieldMismatches = expectedFields
    .filter((entry) => !fieldMatches(entry))
    .map(({ collection, field }) => collection.slug + "." + field.slug);

  const relationSlugs = seed.relations.map((relation) => relation.slug);
  const relationRows = query(
    database,
    "SELECT slug,parent_collection,child_collection FROM _emdash_relations WHERE slug IN (" +
      relationSlugs.map(quoteSql).join(",") +
      ") ORDER BY slug"
  );
  const actualRelations = new Set(
    relationRows.map(
      (relation) =>
        relation.slug + "/" + relation.parent_collection + "/" + relation.child_collection
    )
  );
  const expectedRelations = new Set(
    seed.relations.map(
      (relation) => relation.slug + "/" + relation.parentCollection + "/" + relation.childCollection
    )
  );

  const errors = [];
  if (
    collectionSet.size !== collectionSlugs.length ||
    collectionSlugs.some((slug) => !collectionSet.has(slug))
  )
    errors.push("one or more Woodhouse collections are missing");
  if (actualFields.size !== expectedFields.length || fieldMismatches.length)
    errors.push(
      "Woodhouse collection fields or editorial defaults differ from the reviewed schema"
    );
  if (
    actualRelations.size !== expectedRelations.size ||
    [...expectedRelations].some((relation) => !actualRelations.has(relation))
  )
    errors.push("Woodhouse content references differ from the reviewed schema");

  const check = publicContentQuery(seed);
  let content = {};
  let referencesVerified = 0;
  if (collectionSet.size === collectionSlugs.length) {
    const tableByContentKey = {
      projects: "ec_projects",
      snapshots: "ec_factory_snapshots",
      statuses: "ec_project_statuses",
      evidence: "ec_evidence_records",
      dispatches: "ec_dispatches",
      incidents: "ec_incidents"
    };
    const expectedTables = Object.entries(check.expected)
      .filter(([, count]) => count > 0)
      .map(([key]) => tableByContentKey[key]);
    const contentTables = query(
      database,
      "SELECT name FROM sqlite_schema WHERE type='table' AND name IN (" +
        expectedTables.map(quoteSql).join(",") +
        ")"
    );
    const contentTableSet = new Set(contentTables.map((row) => row.name));
    if (expectedTables.some((table) => !contentTableSet.has(table))) {
      errors.push("one or more Woodhouse content tables are missing");
    } else {
      content = query(database, check.sql)[0] ?? {};
      if (Object.entries(check.expected).some(([key, count]) => Number(content[key] ?? 0) < count))
        errors.push("published, public-safe starter records or their required links are missing");
      const referenceCheck = verifySeedReferences(database, seed);
      referencesVerified = referenceCheck.verifiedRelations;
      if (referenceCheck.mismatches.length)
        errors.push(
          "seeded content references do not exactly match their reviewed targets: " +
            referenceCheck.mismatches.join(", ")
        );
    }
  }

  return {
    ready: errors.length === 0,
    errors,
    fieldMismatches,
    collectionsVerified: collectionSet.size,
    referencesVerified,
    starterContent: Object.fromEntries(
      Object.keys(check.expected).map((key) => [key, Number(content[key] ?? 0)])
    ),
    expectedStarterContent: check.expected
  };
}

export function getReadinessDatabase(environment) {
  return databases[environment] ?? null;
}
