import BusMap from "../components/BusMap";
import BusInfo from "../components/BusInfo";

export default function MapPage({ busState, polyline, stops }) {
  return (
    <div className="app-body">
      <BusMap busState={busState} polyline={polyline} stops={stops} />
      <BusInfo busState={busState} />
    </div>
  );
}
