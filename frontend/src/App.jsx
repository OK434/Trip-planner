import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  // Search state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cardSimple, setCardSimple] = useState(false);

  // Activities state
  const [activityInput, setActivityInput] = useState("");
  const [activities, setActivities] = useState([]);
  
  // Dates state
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  
  // Budget & flights state
  const [budget, setBudget] = useState("");
  const [includeFlights, setIncludeFlights] = useState(false);
  
  // Plans state
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const handleSimpleSearch = () => {
    if (!search) return;
    setActivities([]); 
    setCardSimple(true);
  };

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // fetch countries
  useEffect(() => {
    if (!debouncedSearch) {
      setCountries([]);
      return;
    }

    setLoading(true);

    fetch(`https://restcountries.com/v3.1/name/${debouncedSearch}`)
      .then((res) => res.json())
      .then((data) => setCountries(Array.isArray(data) ? data : []))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  // Add activity
  const handleAddActivity = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!activityInput.trim()) return;
      if (activities.length >= 5) return;

      setActivities([...activities, activityInput.trim()]);
      setActivityInput("");
    }
  };

  // delete activity
  const handleDeleteActivity = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleGeneratePlan = async () => {
    setLoadingPlans(true);
    setCardSimple(false);
    try {
      const duration =
        startDate && endDate
          ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
          : 7;

      const res = await fetch("http://localhost:1231/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budget,
          includeFlights,
          date: duration,
          activities,
          country: search,
        }),
      });

      const data = await res.json();
      setPlans(Array.isArray(data.plans) ? data.plans : []);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while generating the plan!");
    } finally {
      setLoadingPlans(false); 
    }
  };

  const handleDownloadPDF = () => {
    const printContent = document.getElementById("pdf-content").innerHTML;
    
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((style) => style.outerHTML)
      .join("");

    const printWindow = window.open('', '', 'height=800,width=800');
    
    printWindow.document.write('<html><head><title>Trip Plan</title>');
    printWindow.document.write(styles);
    printWindow.document.write('</head><body class="bg-white text-black p-8">');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900 text-white font-sans font-medium">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-[400px] text-center">
        <h1 className="text-3xl font-bold mb-6">✈️ Trip Planner</h1>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search country..."
            value={search}
            className="w-full px-4 py-3 rounded-lg text-black outline-none focus:ring-2 focus:ring-purple-400"
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading && <p className="text-sm mt-2 text-gray-300">Loading...</p>}

          {countries.length > 0 && (
            <div className="absolute w-full bg-white text-black mt-2 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10 text-left">
              {countries.map((c) => (
                <div
                  key={c.cca3}
                  className="flex items-center gap-3 p-3 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setSearch(c.name.common);
                    setCountries([]);
                  }}
                >
                  <img
                    src={c.flags.png}
                    alt={c.name.common}
                    className="w-6 h-4 object-cover"
                  />
                  <span>{c.name.common}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Button */}
        <div className="flex justify-center mt-6">
          <button
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
            onClick={handleSimpleSearch}
          >
            Details
          </button>
        </div>
      </div>

      {/* Card Overlay */}
      {cardSimple && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-600 w-[500px] max-w-[90%] p-6 rounded-2xl shadow-2xl relative">
            {/* Close */}
            <button
              onClick={() => setCardSimple(false)}
              className="absolute top-3 right-4 text-white text-xl hover:text-red-300 transition"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              ✈️ Trip Settings
            </h2>

            <div className="flex flex-col gap-5 text-left">
              {/* Budget */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold">💰 Budget</label>
                <input
                  type="number"
                  placeholder="Enter your budget ($)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="p-3 rounded-lg text-black bg-white border-2 border-transparent focus:border-purple-300 outline-none transition"
                />

                <label className="flex items-center gap-2 text-white mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-purple-800 w-4 h-4 cursor-pointer"
                    checked={includeFlights}
                    onChange={(e) => setIncludeFlights(e.target.checked)}
                  />
                  Include flights
                </label>
              </div>

              {/* Dates */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold">📅 Travel Dates</label>
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  placeholderText="Select travel dates"
                  className="w-full p-3 rounded-lg text-black bg-white border-2 border-transparent focus:border-purple-300 outline-none transition"
                />
              </div>

              {/* Activities */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold">
                  🎯 Activities (max 5)
                </label>

                <input
                  type="text"
                  placeholder="Type activity and press Enter..."
                  value={activityInput}
                  onChange={(e) => setActivityInput(e.target.value)}
                  onKeyDown={handleAddActivity}
                  disabled={activities.length >= 5}
                  className="p-3 rounded-lg text-black bg-white border-2 border-transparent focus:border-purple-300 outline-none transition disabled:bg-gray-200"
                />

                <div className="flex flex-wrap gap-2 mt-2">
                  {activities.map((act, index) => (
                    <span
                      key={index}
                      className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm"
                    >
                      {act}
                      <button
                        onClick={() => handleDeleteActivity(index)}
                        className="font-bold text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {activities.length >= 5 && (
                  <p className="text-sm text-red-300 font-bold">
                    ⚠️ Maximum 5 activities reached
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleGeneratePlan}
                className="bg-white text-purple-800 py-3 mt-2 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-md"
              >
                Confirm Plan 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loadingPlans && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-purple-500 mb-4"></div>
          <p className="text-white text-xl font-bold animate-pulse">
            Generating your trip plans...
          </p>
        </div>
      )}

      {/* Plans Display */}
      {!loadingPlans && plans.length > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-800 p-6 rounded-2xl shadow-2xl max-w-4xl w-full relative max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setPlans([])}
              className="absolute top-4 right-5 text-white hover:text-red-300 text-2xl transition font-bold"
            >
              ✕
            </button>

            {/* Header and Download Button */}
            <div className="flex justify-between items-center mb-6 mt-2 pr-8">
              <h2 className="text-2xl font-bold text-white">Your Trip Plans</h2>
              <button
                onClick={handleDownloadPDF}
                className="bg-white text-purple-800 px-5 py-2 rounded-lg font-bold hover:bg-gray-100 shadow transition"
              >
                📄 Print / Save as PDF
              </button>
            </div>

            {/* Content to be printed */}
            <div
              id="pdf-content"
              className="overflow-y-auto bg-white text-black p-8 rounded-xl shadow-inner text-left"
            >
              <div className="text-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-purple-800">
                  {search} Trip Plan
                </h1>
              </div>

              {plans.map((plan, index) => (
                <div key={index} className="mb-8 border-b-2 border-gray-100 pb-6">
                  <h3 className="text-2xl font-bold mb-4 text-purple-700">
                    {plan.title}
                  </h3>

                  <ul className="list-none space-y-4">
                    {plan.days.map((day, i) => (
                      <li key={i} className="mb-2">
                        {typeof day === "string" ? (
                          <p className="text-gray-700">{day}</p>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                            <p className="font-bold text-lg text-purple-800 border-b border-gray-200 pb-2 mb-3">
                              📅 Day {day.day} - {day.location}
                            </p>
                            <ul className="list-disc ml-6 space-y-2">
                              {day.activities?.map((act, j) => (
                                <li key={j} className="text-gray-700">
                                  {typeof act === "string" ? (
                                    act
                                  ) : (
                                    <>
                                      <span className="font-bold text-purple-600">
                                        {act.time}
                                      </span>{" "}
                                      - {act.description}
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;