import Spinner from "../../components/Spinner";

export default function Loading() {
  return (
    <div className="panel p-6">
      <Spinner label="Loading results" />
    </div>
  );
}

