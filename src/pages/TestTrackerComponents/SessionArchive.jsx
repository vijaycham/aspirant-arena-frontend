import React from "react";

const SessionArchive = ({
  filteredTests,
  loading,
  page,
  setPage,
  editingId,
  handleEdit,
  setConfirmDeleteData,
  setViewingReflection,
}) => {
  return (
    <div className="mt-8 md:mt-12 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
        <h3 className="text-base md:text-lg font-black text-gray-800">Archive of Sessions</h3>
        <div className="flex items-center gap-3">
          {/* Pagination Controls */}
          {filteredTests.length > 10 && (
            <div className="flex items-center gap-1 md:gap-2 mr-2 md:mr-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 md:p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <span className="text-[10px] md:text-xs font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                {page} / {Math.ceil(filteredTests.length / 10)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(Math.ceil(filteredTests.length / 10), p + 1))}
                disabled={page >= Math.ceil(filteredTests.length / 10)}
                className="p-1 md:p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          )}
          <span className="bg-primary-50 text-primary-600 text-[8px] md:text-[10px] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl uppercase tracking-widest border border-primary-100">
            {filteredTests.length} Logs
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 md:py-24 text-center text-gray-300 font-black animate-pulse uppercase tracking-widest text-xs">
          Compiling Analytics...
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="py-12 md:py-24 text-center p-6 md:p-12 bg-gray-50 rounded-[1.5rem] md:rounded-[3rem] border-4 border-dotted border-gray-200">
          <p className="text-gray-400 font-black uppercase text-[10px] md:text-xs tracking-widest leading-loose">
            Log your first mock test to begin.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <div className="min-w-[700px] px-6 md:px-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-4 md:px-8 py-5">Topic & Title</th>
                  <th className="px-4 md:px-8 py-5 text-center">Efficiency</th>
                  <th className="px-4 md:px-6 py-5 whitespace-nowrap">Exam Date</th>
                  <th className="px-4 md:px-4 py-5 font-black text-center">Reflect</th>
                  <th className="px-4 md:px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTests.slice((page - 1) * 10, page * 10).map((t) => (
                  <tr
                    key={t._id}
                    className={`group transition-all cursor-default align-middle ${
                      editingId === t._id ? "bg-indigo-50 hover:bg-indigo-100" : "hover:bg-gray-50/30"
                    }`}
                  >
                    <td className="px-4 md:px-8 py-4 md:py-6 align-middle">
                      <div className="flex flex-col">
                        <span className="text-[11px] md:text-sm font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                          {t.subject}
                        </span>
                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-[200px]">
                          {t.testName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6 align-middle">
                      <div className="flex flex-col items-center">
                        <span className="text-[12px] md:text-base font-black text-gray-900">
                          {Math.round((t.marksObtained / (t.totalMarks || 1)) * 100)}%
                        </span>
                        <div className="w-10 md:w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              (t.marksObtained / (t.totalMarks || 1)) >= 0.75 ? 'bg-emerald-500' :
                              (t.marksObtained / (t.totalMarks || 1)) >= 0.50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${(t.marksObtained / (t.totalMarks || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 align-middle text-center md:text-left">
                      <span className="text-[8px] md:text-[11px] font-black text-gray-500 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-tighter whitespace-nowrap border border-gray-100/50">
                        {new Date(t.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-4 md:px-4 py-4 md:py-6 text-center align-middle">
                      <button
                        onClick={() =>
                          setViewingReflection({
                            subject: t.subject,
                            testName: t.testName,
                            reflection: t.reflection,
                            marks: t.marksObtained,
                            total: t.totalMarks,
                            timeTaken: t.timeTaken,
                            startTime: t.startTime,
                          })
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all text-[8px] md:text-[9.5px] font-black uppercase tracking-tighter shadow-sm border border-indigo-100/50 group/btn"
                      >
                        <svg className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Insight
                      </button>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-6 text-right align-middle">
                      <div className="flex justify-end gap-2 md:gap-4">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1 text-gray-300 hover:text-indigo-600 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteData({ id: t._id, name: t.testName, subject: t.subject })}
                          className="p-1 text-gray-300 hover:text-rose-500 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionArchive;
