"""Geometry for Loom Display.

Every curve in the face is a superellipse of one exponent and every straight
joint is bevelled, so a letter is a fibre bent to a shape rather than a drawing
made by hand. These helpers build the outlines; the design itself lives in
loom-font.py.
"""

from __future__ import annotations

import math

import numpy as np

UPM = 1000
STROKE = 84.0
CAP = 700.0
EXPONENT = 2.55


def superellipse(
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    a0: float = 0.0,
    a1: float = 360.0,
    steps: int | None = None,
    exponent: float = EXPONENT,
) -> list[tuple[float, float]]:
    """Sample a superellipse between two angles, measured in degrees from east."""
    if steps is None:
        steps = max(12, int(abs(a1 - a0) / 3.2) + 1)
    points: list[tuple[float, float]] = []
    power = 2.0 / exponent
    for angle in np.linspace(math.radians(a0), math.radians(a1), steps):
        c, s = math.cos(angle), math.sin(angle)
        x = cx + rx * math.copysign(abs(c) ** power, c)
        y = cy + ry * math.copysign(abs(s) ** power, s)
        points.append((float(x), float(y)))
    return points


def point_tuple(point) -> tuple[float, float]:
    """A numpy pair as a plain float tuple."""
    return (float(point[0]), float(point[1]))


def _unit_vectors(arrays: np.ndarray) -> np.ndarray:
    lengths = np.linalg.norm(arrays, axis=1, keepdims=True)
    return arrays / np.where(lengths == 0, 1.0, lengths)


def _tangents_closed(points: np.ndarray) -> np.ndarray:
    return np.roll(points, -1, axis=0) - np.roll(points, 1, axis=0)


def _tangents_open(points: np.ndarray) -> np.ndarray:
    tangents = np.empty_like(points)
    tangents[1:-1] = points[2:] - points[:-2]
    tangents[0] = points[1] - points[0]
    tangents[-1] = points[-1] - points[-2]
    return tangents


def offset_closed(
    points: list[tuple[float, float]], distance: float
) -> list[tuple[float, float]]:
    """Offset a closed contour along its outward normal."""
    data = np.asarray(points, dtype=float)
    tangents = _unit_vectors(_tangents_closed(data))
    normals = np.stack([tangents[:, 1], -tangents[:, 0]], axis=1)
    return [(float(x), float(y)) for x, y in data + distance * normals]


def offset_open(
    points: list[tuple[float, float]],
    distance: float,
    join: str = "miter",
    miter_limit: float = 3.0,
) -> list[tuple[float, float]]:
    """Offset an open polyline to one side, mitring or bevelling its joints."""
    data = np.asarray(points, dtype=float)
    tangents = _unit_vectors(_tangents_open(data))
    normals = np.stack([tangents[:, 1], -tangents[:, 0]], axis=1)
    result: list[tuple[float, float]] = [point_tuple(data[0] + distance * normals[0])]
    for index in range(1, len(data) - 1):
        before, after = normals[index - 1], normals[index]
        if join == "bevel" or float(np.dot(before, after)) < -0.94:
            result.append((point_tuple(data[index] + distance * before)))
            result.append((point_tuple(data[index] + distance * after)))
            continue
        # Intersect the two offset lines so the joint keeps its full width.
        matrix = np.array([tangents[index - 1], -tangents[index]]).T
        try:
            solution = np.linalg.solve(matrix, (after - before) * distance)
        except np.linalg.LinAlgError:
            solution = None
        if solution is None or not np.all(np.isfinite(solution)):
            result.append((point_tuple(data[index] + distance * before)))
            result.append((point_tuple(data[index] + distance * after)))
            continue
        point = data[index] + distance * before + solution[0] * tangents[index - 1]
        if float(np.linalg.norm(point - data[index])) > miter_limit * abs(distance):
            result.append((point_tuple(data[index] + distance * before)))
            result.append((point_tuple(data[index] + distance * after)))
        else:
            result.append(point_tuple(point))
    result.append(point_tuple(data[-1] + distance * normals[-1]))
    return result


def band(
    spine: list[tuple[float, float]],
    width: float = STROKE,
    join: str = "bevel",
) -> list[tuple[float, float]]:
    """A stroked polyline as one contour, butt-capped at both ends."""
    left = offset_open(spine, width / 2, join=join)
    right = offset_open(spine, -width / 2, join=join)
    return left + right[::-1]


def ring(
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    width: float = STROKE,
    a0: float = 0.0,
    a1: float = 360.0,
) -> list[list[tuple[float, float]]]:
    """A closed annulus, or an open arc band, from one superellipse."""
    spine = superellipse(cx, cy, rx, ry, a0, a1)
    if abs(a1 - a0) >= 359.9:
        return [offset_closed(spine, width / 2), offset_closed(spine, -width / 2)[::-1]]
    outer = offset_open(spine, width / 2)
    inner = offset_open(spine, -width / 2)
    return [outer + inner[::-1]]


def half_disc(
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    flat: float,
) -> list[tuple[float, float]]:
    """A solid right half-bowl, closed against a flat side.

    `flat` is the x where the bowl meets the stem. A counter uses a flat
    further right than the bowl itself so the two never share an edge.
    """
    spine = superellipse(cx, cy, rx, ry, -90.0, 90.0)
    return spine + [(flat, spine[-1][1]), (flat, spine[0][1])]


def rect(x0: float, y0: float, x1: float, y1: float) -> list[tuple[float, float]]:
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def bezier(
    p0: tuple[float, float],
    c1: tuple[float, float],
    c2: tuple[float, float],
    p3: tuple[float, float],
    steps: int = 64,
) -> list[tuple[float, float]]:
    points = []
    for t in np.linspace(0.0, 1.0, steps):
        u = 1.0 - t
        x = u**3 * p0[0] + 3 * u**2 * t * c1[0] + 3 * u * t**2 * c2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * c1[1] + 3 * u * t**2 * c2[1] + t**3 * p3[1]
        points.append((float(x), float(y)))
    return points


def clip(
    contour: list[tuple[float, float]],
    x0: float,
    y0: float,
    x1: float,
    y1: float,
) -> list[tuple[float, float]]:
    """Sutherland-Hodgman clip against the glyph box."""

    def clip_edge(points, keep, intersect):
        output = []
        for index, current in enumerate(points):
            previous = points[index - 1]
            if keep(current):
                if not keep(previous):
                    output.append(intersect(previous, current))
                output.append(current)
            elif keep(previous):
                output.append(intersect(previous, current))
        return output

    def at_x(x):
        return lambda p, q: (
            x,
            p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0]) if q[0] != p[0] else p[1],
        )

    def at_y(y):
        return lambda p, q: (
            p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]) if q[1] != p[1] else p[0],
            y,
        )

    points = contour
    for keep, intersect in (
        (lambda p: p[0] >= x0, at_x(x0)),
        (lambda p: p[0] <= x1, at_x(x1)),
        (lambda p: p[1] >= y0, at_y(y0)),
        (lambda p: p[1] <= y1, at_y(y1)),
    ):
        if not points:
            break
        points = clip_edge(points, keep, intersect)
    # Drop consecutive duplicates so the contour stays valid after clipping.
    cleaned = []
    for point in points:
        if not cleaned or abs(point[0] - cleaned[-1][0]) > 0.01 or abs(point[1] - cleaned[-1][1]) > 0.01:
            cleaned.append((float(point[0]), float(point[1])))
    return cleaned


def reverse(contour: list[tuple[float, float]]) -> list[tuple[float, float]]:
    return contour[::-1]
