import { parameter } from "@/lib/parameter";

const SelectStats = ({ setconfig }) => {
  return (
    <select
      onChange={(e) => setconfig(e.target.value)}
      className="py-3 px-4 pe-9 block w-full  border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
    >
      <option value="">Select Stats</option>
      {parameter.map((item) => {
        return <option key={item.content}>{item.content}</option>;
      })}
    </select>
  );
};

export default SelectStats;
