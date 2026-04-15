import React from "react";
import { AIRLINES } from "../../data/mockData";

function RouteMapSVG({ from, to }) {
  const toXY=(lat,lng)=>({x:((lng+180)/360)*280, y:((90-lat)/180)*140});
  const p1=toXY(from.lat,from.lng), p2=toXY(to.lat,to.lng);
  const mx=(p1.x+p2.x)/2, my=Math.min(p1.y,p2.y)-22;
  const t=0.5;
  const ax=(1-t)*(1-t)*p1.x+2*(1-t)*t*mx+t*t*p2.x;
  const ay=(1-t)*(1-t)*p1.y+2*(1-t)*t*my+t*t*p2.y;
  return (
    <svg viewBox="0 0 280 140" style={{width:"100%",height:"130px",display:"block",borderRadius:"8px"}}>
      <rect width="280" height="140" fill="#dde4f0" rx="8"/>
      {[40,80,120,160,200,240].map(x=><line key={x} x1={x} y1="0" x2={x} y2="140" stroke="#c8d0e4" strokeWidth="0.5"/>)}
      {[40,80,120].map(y=><line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#c8d0e4" strokeWidth="0.5"/>)}
      <path d={`M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`} fill="none" stroke="#1a237e" strokeWidth="1.5" strokeDasharray="5 3"/>
      <text x={ax} y={ay-4} textAnchor="middle" fontSize="10">✈</text>
      <circle cx={p1.x} cy={p1.y} r="5" fill="#1a237e"/><circle cx={p1.x} cy={p1.y} r="2.5" fill="#fff"/>
      <text x={p1.x} y={p1.y+12} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1a237e">{from.iata}</text>
      <circle cx={p2.x} cy={p2.y} r="5" fill="#c62828"/><circle cx={p2.x} cy={p2.y} r="2.5" fill="#fff"/>
      <text x={p2.x} y={p2.y+12} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#c62828">{to.iata}</text>
      <rect x={Math.min(Math.max(p2.x-28,2),220)} y={p2.y+15} width="56" height="13" rx="3" fill="#c62828" opacity="0.85"/>
      <text x={Math.min(Math.max(p2.x,30),248)} y={p2.y+24} textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">{to.city}</text>
    </svg>
  );
}

export default function RouteCard({ route }) {
  const airline=AIRLINES.find((a)=>a.id===route.airline);
  return (
    <div className="route-card">
      <div className="route-card__map"><RouteMapSVG from={route.from} to={route.to}/></div>
      <div className="route-card__info">
        <div className="route-card__name">{route.to.name.length>32?route.to.name.slice(0,32)+"…":route.to.name}</div>
        <div className="route-card__city">{route.to.city}</div>
        <div className="route-card__pills">
          <span className="pill">{route.from.iata}</span>
          <span className="pill-arrow">→</span>
          <span className="pill red">{route.to.iata}</span>
          <span className="pill">{route.distance}</span>
          <span className="pill">{route.duration}</span>
        </div>
        {airline && <div className="route-card__airline">{airline.name}</div>}
      </div>
    </div>
  );
}
