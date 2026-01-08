import React from "react";
import Shimmer from "../../components/Shimmer";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";

const AnalyticsSection = ({
  selectedSubject,
  chartData,
  currentTarget,
  mistakeData,
  stats,
  loading,
}) => {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Line Chart */}
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-[300px] md:h-[400px]">
          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black text-gray-800">
              {selectedSubject === "All" ? "Performance Trend" : `${selectedSubject} Mastery`}
            </h3>
            <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
              Consistency Tracker
            </p>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? (
              <Shimmer variant="card" className="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 100]} stroke="#cbd5e1" fontSize={9} tick={{ fontWeight: "bold" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.98)",
                      borderRadius: "1rem",
                      border: "1px solid #f1f5f9",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#1e293b" }}
                    labelStyle={{ color: "#64748b", marginBottom: "4px" }}
                  />
                  <ReferenceLine
                    y={currentTarget}
                    label={{ value: "🎯", position: "insideRight", fill: "#6366f1" }}
                    stroke="#6366f1"
                    strokeDasharray="6 6"
                    strokeWidth={1.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Mistake Breakdown Pie */}
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-[300px] md:h-[400px]">
          <div className="mb-4 md:mb-6 text-center">
            <h3 className="text-base md:text-lg font-black text-gray-800">Analysis of Lost Marks</h3>
            <p className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 text-nowrap">
              Strategic Breakdown
            </p>
          </div>
          <div className="flex-1 min-h-0 relative">
            {loading ? (
              <Shimmer variant="circle" className="w-48 h-48 md:w-64 md:h-64 mx-auto mt-4" />
            ) : mistakeData.every((d) => d.value === 0) ? (
              <div className="absolute inset-4 flex items-center justify-center text-center p-6 md:p-12 bg-gray-50/50 rounded-full border-2 border-dashed border-gray-100">
                <p className="text-gray-300 font-black uppercase text-[8px] md:text-[10px] tracking-widest leading-loose">
                  Add error data
                  <br />
                  to generate charts
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mistakeData.filter((d) => d.value > 0)}
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    activeShape={false}
                  >
                    {mistakeData
                      .filter((d) => d.value > 0)
                      .map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Conceptual"
                              ? "#6366f1"
                              : entry.name === "Silly"
                              ? "#f43f5e"
                              : entry.name === "Time"
                              ? "#f59e0b"
                              : "#94a3b8"
                          }
                        />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.98)",
                      borderRadius: "1rem",
                      border: "1px solid #f1f5f9",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#1e293b" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Proficiency Matrix */}
      <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-base md:text-lg font-black text-gray-800 mb-6 md:mb-10 border-l-4 md:border-l-8 border-primary-600 pl-4 uppercase tracking-tighter">
          Subject Proficiency Matrix
        </h3>
        <div className="h-[250px] md:h-[320px]">
          {loading ? (
            <Shimmer variant="card" className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.map((s) => ({
                  name: s._id,
                  accuracy: Math.round(s.avgScore * 100),
                  target: s.avgTarget,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 8, fill: "#94a3b8", fontWeight: "900", textTransform: "uppercase" }}
                />
                <YAxis domain={[0, 100]} stroke="#cbd5e1" fontSize={9} tick={{ fontWeight: "bold" }} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    borderRadius: "1rem",
                    border: "1px solid #f1f5f9",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                  labelStyle={{ color: "#64748b", marginBottom: "4px" }}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} barSize={30}>
                  {stats.map((s, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Math.round(s.avgScore * 100) >= s.avgTarget ? "#10b981" : "#f43f5e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
