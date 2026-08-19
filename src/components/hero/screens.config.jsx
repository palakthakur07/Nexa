// Data-driven hero screen placement — position/rotation/depth/motion are
// all configured here rather than hardcoded per-screen JSX, so the
// composition can be art-directed without touching HeroScene.
import { OpportunityScreen, PeopleScreen, RoadmapScreen, NexaScreen, FundingScreen, CommunityScreen } from "./MiniScreens.jsx";

export function buildScreens({ onNavigateDiscover, onNavigatePeople, onNavigateRoadmap, onOpenNexa }) {
  return [
    { id: "funding", label: "Funding", x: 300, y: -215, z: -230, scale: 0.82, rotate: { x: 3, y: -16, z: 2 }, width: 140, far: true, float: { fx: 5, fy: -7, fz: -6, fr: 0.6, dur: 10, delay: -0.6 }, render: () => <FundingScreen />, onClick: onNavigateDiscover },
    { id: "community", label: "Communities", x: 40, y: 250, z: -260, scale: 0.8, rotate: { x: -3, y: 10, z: -1 }, width: 130, far: true, float: { fx: -5, fy: -6, fz: -5, fr: -0.7, dur: 11, delay: -3.8 }, render: () => <CommunityScreen />, onClick: onNavigatePeople },
    { id: "people", label: "People who've been there", x: -300, y: -185, z: -60, scale: 0.98, rotate: { x: 2, y: 14, z: 1.4 }, width: 180, far: false, float: { fx: -6, fy: -10, fz: 6, fr: 0.9, dur: 8, delay: -2.1 }, render: () => <PeopleScreen />, onClick: onNavigatePeople },
    { id: "nexa", label: "Nexa", x: -50, y: -235, z: 60, scale: 1, rotate: { x: 1, y: -8, z: -1.6 }, width: 168, far: false, float: { fx: 5, fy: -8, fz: 8, fr: -0.8, dur: 7, delay: -1.3 }, render: () => <NexaScreen />, onClick: onOpenNexa },
    { id: "opportunity", label: "Opportunities", x: -330, y: 120, z: 120, scale: 1, rotate: { x: -1, y: 13, z: -2.4 }, width: 212, far: false, float: { fx: -7, fy: 8, fz: 10, fr: -1, dur: 6.4, delay: -1.1 }, render: () => <OpportunityScreen />, onClick: onNavigateDiscover },
    { id: "roadmap", label: "Your roadmap", x: 305, y: 145, z: 100, scale: 1, rotate: { x: 2, y: -12, z: 2.2 }, width: 210, far: false, float: { fx: 7, fy: 10, fz: 9, fr: 1, dur: 6.9, delay: -3.6 }, render: () => <RoadmapScreen />, onClick: onNavigateRoadmap },
  ];
}
