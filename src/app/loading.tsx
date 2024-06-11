import { ClipLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <ClipLoader color="#f97316" speedMultiplier={1} size={50} />
        <p className="mt-3 text-lg">Loading...</p>
      </div>
    </div>
  );
}
