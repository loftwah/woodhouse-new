import React from 'react';
import {AbsoluteFill, Composition, Sequence, Img, Audio, OffthreadVideo, interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const ink='#0a1110', paper='#f4f2e8', acid='#d6fb42';
const scenes=[
 {start:3,duration:5,name:'Protocol 11',title:'Keep the red.\nExtend the run.',copy:'A card table that changes its rules.',note:'19 October 2026 · seeded Classic demonstration',color:'#78d7ef',file:'share/protocol-11/campaign-2026-10-19/climax-full-match-28s.mp4',trim:4},
 {start:8,duration:5,name:'SHOALSHOT',title:'Read the tide.\nPlace the shot.',copy:'Aim into a moving underwater field.',note:'September 2026 · controlled showcase · earlier art',color:'#6de1c2',file:'share/shoalshot/video/tideglass-landscape.mp4',portrait:'share/shoalshot/video/tideglass-portrait.mp4',trim:1.5},
 {start:13,duration:4,name:'Bubbles',title:'Find the angle.\nClear the board.',copy:'A small shot can open the whole board.',note:'Historical controlled showcase · earlier interface',color:'#e0b5f5',file:'share/bubbles/board-clear-highlight-clean.mp4',trim:0},
 {start:17,duration:4,name:'Fighter',title:'Choose a squad.\nOwn the fight.',copy:'Different fighters. Different decisions.',note:'2026 published showcase · earlier interface',color:'#ff6a62',file:'share/fighter/loftwah-fighter-multi-match-15s-1080p.mp4',portrait:'share/fighter/loftwah-fighter-multi-match-15s-portrait.mp4',trim:3},
 {start:21,duration:4,name:'LoftwahFM',title:'Keep the music.\nChange the game.',copy:'Discover a track. Explore music for games.',note:'Playing: Pixel Box Theory · Cartridge Funk · Loftwah',color:'#a6caff',image:'share/loftwahfm/cartridge-funk.jpg'},
 {start:25,duration:5,name:'App Composer',title:'Two apps.\nYour connection.',copy:'Place a postcard in a page. Save a demo revision.',note:'23 October 2026 · fictional, on-device demo · no deployment',color:'#ff812e',file:'composer-demo.webm',trim:0},
];
const Font=()=> <style>{`@font-face{font-family:Bricolage;src:url('${staticFile('bold.ttf')}');font-weight:700}@font-face{font-family:Bricolage;src:url('${staticFile('regular.ttf')}');font-weight:400}*{box-sizing:border-box}`}</style>;
function Product({scene}) {
 const frame=useCurrentFrame(); const {width,height}=useVideoConfig(); const tall=height>width;
 const mediaStyle={position:'absolute',left:tall?48:790,top:tall?555:70,width:tall?984:1060,height:tall?1110:860,background:'#080b0c',overflow:'hidden'};
 return <AbsoluteFill style={{background:ink,color:paper,fontFamily:'Bricolage'}}>
  <div style={{position:'absolute',left:tall?60:72,top:tall?90:80,right:tall?60:1180,opacity:interpolate(frame,[0,7],[0,1],{extrapolateRight:'clamp'})}}>
   <div style={{color:scene.color,fontSize:tall?38:33,fontWeight:700,marginBottom:tall?28:34}}>{scene.name}</div>
   <h1 style={{fontSize:tall?87:91,lineHeight:1.03,letterSpacing:'-.035em',whiteSpace:'pre-line',margin:'0 0 28px',fontWeight:700}}>{scene.title}</h1>
   <p style={{fontSize:tall?36:35,lineHeight:1.25,maxWidth:650,margin:0}}>{scene.copy}</p>
  </div>
  <div style={{...mediaStyle,translate:`0 ${interpolate(frame,[0,12],[16,0],{extrapolateRight:'clamp'})}px`}}>
   {scene.image ? <Img src={staticFile(scene.image)} style={{width:'100%',height:'100%',objectFit:'contain'}}/> : <OffthreadVideo src={staticFile(tall&&scene.portrait?scene.portrait:scene.file)} trimBefore={Math.round(scene.trim*30)} muted style={{width:'100%',height:'100%',objectFit:'contain'}}/>}
  </div>
  <div style={{position:'absolute',left:tall?60:72,right:60,bottom:tall?118:57,borderTop:`2px solid ${scene.color}`,paddingTop:20,display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:32}}>
   <span style={{fontSize:tall?29:26,maxWidth:tall?920:1400}}>{scene.note}</span>
   {!tall&&<span style={{fontSize:23,color:acid}}>WOODHOUSE · ONE MORE ROUND</span>}
  </div>
 </AbsoluteFill>;
}
function Invitation({end=false}) {
 const frame=useCurrentFrame();const {width,height}=useVideoConfig();const tall=height>width;
 return <AbsoluteFill style={{background:ink,color:paper,fontFamily:'Bricolage',padding:tall?'110px 65px':'75px 80px'}}>
  <div style={{fontSize:tall?30:26,fontWeight:700,color:acid,marginBottom:tall?58:44}}>WOODHOUSE</div>
  <div style={{position:'relative',zIndex:2,width:tall?'100%':'48%'}}>
   <h1 style={{fontSize:tall?164:176,lineHeight:.91,letterSpacing:'-.04em',margin:0}}>One more<br/><span style={{color:acid}}>round.</span></h1>
   <p style={{fontSize:tall?43:43,lineHeight:1.16,maxWidth:tall?870:700,marginTop:tall?42:40}}>{end?'Find something worth your time.':'A table. A shot. A board. A squad.'}</p>
  </div>
  {!end&& <div style={{position:'absolute',left:tall?65:1040,top:tall?880:100,width:tall?950:800,height:tall?650:790}}>
   <Img src={staticFile('share/protocol-11/table-layout-production-1366x768.png')} style={{position:'absolute',left:0,top:0,width:tall?900:780,height:tall?420:430,objectFit:'cover',objectPosition:'center',rotate:'-3deg'}}/>
   <Img src={staticFile('share/shoalshot/screenshot/after-production-action-1728x918.png')} style={{position:'absolute',left:tall?40:35,top:tall?290:365,width:tall?900:780,height:tall?420:430,objectFit:'cover',objectPosition:'center',rotate:'3deg'}}/>
  </div>}
  {end&&<div style={{position:'absolute',left:tall?65:1050,top:tall?850:150,color:paper,fontSize:tall?55:57,lineHeight:1.28}}><div>Play the games.</div><div>Hear the music.</div><div>Try a composition.</div></div>}
  <div style={{position:'absolute',left:tall?65:80,right:65,bottom:tall?140:65,borderTop:`2px solid ${acid}`,paddingTop:26,fontSize:tall?34:35,lineHeight:1.3}}>
   {end?<><strong>woodhouse.loftwah.com</strong><br/>/editions/one-more-round/</>:<>Protocol 11 · SHOALSHOT · Bubbles · Fighter<br/>LoftwahFM · App Composer</>}
  </div>
 </AbsoluteFill>;
}
function Film(){const frame=useCurrentFrame();return <AbsoluteFill><Font/><Sequence durationInFrames={90}><Invitation/></Sequence>{scenes.map(scene=><Sequence key={scene.name} from={scene.start*30} durationInFrames={scene.duration*30}><Product scene={scene}/></Sequence>)}<Sequence from={900} durationInFrames={90}><Invitation end/></Sequence><Audio src={staticFile('music.mp3')} trimBefore={480} volume={interpolate(frame,[0,9,930,989],[0,.56,.56,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}/></AbsoluteFill>}
function Poster(){return <AbsoluteFill><Font/><Invitation/></AbsoluteFill>}
function Root(){return <>{[['Landscape',1920,1080],['Vertical',1080,1920]].map(([name,width,height])=><Composition key={name} id={'Edition'+name} component={Film} width={width} height={height} durationInFrames={990} fps={30}/>)}<Composition id="InvitationLandscape" component={Poster} width={1920} height={1080} durationInFrames={1} fps={30}/><Composition id="InvitationPortrait" component={Poster} width={1080} height={1920} durationInFrames={1} fps={30}/></>}
registerRoot(Root);
