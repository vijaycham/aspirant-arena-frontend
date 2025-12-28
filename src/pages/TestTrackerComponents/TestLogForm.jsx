import React from "react";

const TestLogForm = ({
  formData,
  setFormData,
  handleSubmit,
  resetForm,
  editingId,
  showAdvance,
  setShowAdvance,
  subjects,
  marksLost,
  accountedMarks
}) => {
  return (
    <div
      className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 lg:sticky lg:top-32 transition-all duration-500 ${
        editingId ? "bg-indigo-50/50 border-indigo-200" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-3">
          <span
            className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-sm ${
              editingId ? "bg-indigo-600 text-white" : "bg-black text-white"
            }`}
          >
            {editingId ? "✏️" : "✍️"}
          </span>
          {editingId ? "Update Record" : "New Test Log"}
        </h2>
        {editingId && (
          <button
            onClick={resetForm}
            className="text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
            Subject Name
          </label>
          <input
            type="text"
            list="subjects-list"
            required
            className="w-full p-2.5 md:p-3.5 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all placeholder:text-gray-300 font-bold text-sm"
            placeholder="e.g. Polity"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
          <datalist id="subjects-list">
            {subjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
            Test / Series Title
          </label>
          <input
            type="text"
            required
            className="w-full p-2.5 md:p-3.5 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-sm"
            placeholder="e.g. Prelims Mock 01"
            value={formData.testName}
            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
          />
        </div>

        {/* Date & Start Time Row */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
              Exam Date
            </label>
            <input
              type="date"
              required
              className="w-full p-2.5 md:p-3.5 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-[11px] md:text-sm"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
              Start Time
            </label>
            <input
              type="time"
              className="w-full p-2.5 md:p-3.5 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-[11px] md:text-sm"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>
        </div>

        {/* Duration & Difficulty Row */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
              Time (Mins)
            </label>
            <input
              type="number"
              className="w-full p-2.5 md:p-3.5 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-sm"
              placeholder="e.g. 120"
              value={formData.timeTaken}
              onChange={(e) => setFormData({ ...formData, timeTaken: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
              Difficulty
            </label>
            <select
              className="w-full p-2.5 md:p-3.5 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-[11px] md:text-sm appearance-none"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Marks & Total Row */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
              Marks Got
            </label>
            <input
              type="number"
              step="any"
              required
              className="w-full p-2.5 md:p-3.5 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-sm"
              value={formData.marksObtained}
              onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
              Total Marks
            </label>
            <input
              type="number"
              step="any"
              required
              className="w-full p-2.5 md:p-3.5 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-sm"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-wider">
            Strategic Reflection / Notes
          </label>
          <textarea
            className="w-full p-3 bg-gray-50/50 border-2 border-transparent border-gray-100 rounded-xl md:rounded-2xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-xs h-24 resize-none"
            placeholder="What went wrong? Any improvement strategy? (Optional)"
            value={formData.reflection}
            onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
          ></textarea>
        </div>

        {/* Tally Helper */}
        {marksLost > 0 &&
          (() => {
            const isOverflow = accountedMarks > marksLost + 0.01;
            const isMatch = Math.abs(accountedMarks - marksLost) < 0.01;

            let bgClass = "bg-orange-50/50 border-orange-100";
            let textClass = "text-orange-400";
            let ringClass = "text-orange-600 ring-orange-100";
            let barClass = "bg-orange-400";
            let statusText = "Lost Marks Tally";

            if (isOverflow) {
              bgClass = "bg-rose-50 border-rose-100";
              textClass = "text-rose-500";
              ringClass = "text-rose-600 ring-rose-100";
              barClass = "bg-rose-500";
              statusText = "Lost Marks Tally (Exceeds Limit!)";
            } else if (isMatch) {
              bgClass = "bg-emerald-50 border-emerald-100";
              textClass = "text-emerald-500";
              ringClass = "text-emerald-600 ring-emerald-100";
              barClass = "bg-emerald-500";
              statusText = "Tally Complete! 🎉";
            }

            return (
              <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-colors ${bgClass}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${textClass}`}>
                    {statusText}
                  </span>
                  <span
                    className={`text-[8px] md:text-[10px] font-black bg-white px-2 py-0.5 rounded-full ring-1 ${ringClass}`}
                  >
                    {accountedMarks.toFixed(2)} / {marksLost.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-1 md:h-1.5 bg-white rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${barClass}`}
                    style={{ width: `${Math.min(100, (accountedMarks / (marksLost || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })()}

        <button
          type="button"
          onClick={() => setShowAdvance(!showAdvance)}
          className="w-full py-2 text-[8px] md:text-[10px] font-black text-gray-400 hover:text-primary-600 flex items-center justify-center gap-2 transition-colors border-y border-gray-50 mt-2 uppercase tracking-widest"
        >
          {showAdvance ? "Hide Error Analysis" : "🎯 Detailed Error Analysis"}
        </button>

        {showAdvance && (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-black text-rose-500 uppercase ml-1 tracking-widest">
                  Conceptual
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full p-2 md:p-2.5 bg-rose-50 border-2 border-transparent rounded-lg md:rounded-xl focus:border-rose-200 outline-none text-rose-700 font-bold text-xs"
                  value={formData.conceptualErrors}
                  onChange={(e) => setFormData({ ...formData, conceptualErrors: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-black text-amber-500 uppercase ml-1 tracking-widest">
                  Silly Mistake
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full p-2 md:p-2.5 bg-amber-50 border-2 border-transparent rounded-lg md:rounded-xl focus:border-amber-200 outline-none text-amber-700 font-bold text-xs"
                  value={formData.sillyMistakes}
                  onChange={(e) => setFormData({ ...formData, sillyMistakes: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-black text-blue-500 uppercase ml-1 tracking-widest">
                  Time Pressure
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full p-2 md:p-2.5 bg-blue-50 border-2 border-transparent rounded-lg md:rounded-xl focus:border-blue-200 outline-none text-blue-700 font-bold text-xs"
                  value={formData.timeErrors}
                  onChange={(e) => setFormData({ ...formData, timeErrors: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                  Unattended
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full p-2 md:p-2.5 bg-slate-100 border-2 border-transparent rounded-lg md:rounded-xl focus:border-slate-300 outline-none text-slate-700 font-bold text-xs"
                  value={formData.unattendedQuestions}
                  onChange={(e) => setFormData({ ...formData, unattendedQuestions: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  My Goal (%)
                </label>
                <span className="text-[11px] md:text-xs font-black text-primary-600">{formData.targetPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full h-1.5 md:h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                value={formData.targetPercentage}
                onChange={(e) => setFormData({ ...formData, targetPercentage: e.target.value })}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3.5 md:py-4 mt-2 text-white font-black rounded-xl md:rounded-2xl hover:scale-[1.02] transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px] md:text-xs ${
            editingId
              ? "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
              : "bg-gray-900 shadow-gray-200 hover:bg-black"
          }`}
        >
          {editingId ? "Save Changes" : "Analyze & Save"}
        </button>
      </form>
    </div>
  );
};

export default TestLogForm;
