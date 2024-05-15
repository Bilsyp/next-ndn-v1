const SelectAbr = ({ setconfig }) => {
  return (
    <select
      onChange={(e) => setconfig(e.target.value)}
      className="py-3 px-4 pe-9 block w-full  border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
    >
      <option value="">Open this select ABR</option>
      <option>Buffer Base</option>
      <option>Rate Base</option>
      <option>Throughput Base</option>
      <option>Hybrid Base</option>
    </select>
  );
};

export default SelectAbr;
