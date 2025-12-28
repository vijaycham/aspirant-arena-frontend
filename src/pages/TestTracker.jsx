import React from "react";
import useTestTracker from "../hooks/useTestTracker";

// Components
import StatsGrid from "./TestTrackerComponents/StatsGrid";
import TestLogForm from "./TestTrackerComponents/TestLogForm";
import AnalyticsSection from "./TestTrackerComponents/AnalyticsSection";
import SessionArchive from "./TestTrackerComponents/SessionArchive";
import InsightModal from "./TestTrackerComponents/Modals/InsightModal";
import DeleteConfirmModal from "./TestTrackerComponents/Modals/DeleteConfirmModal";

const TestTracker = () => {
  const {
    stats,
    subjects,
    selectedSubject,
    setSelectedSubject,
    loading,
    showAdvance,
    setShowAdvance,
    editingId,
    confirmDeleteData,
    setConfirmDeleteData,
    viewingReflection,
    setViewingReflection,
    page,
    setPage,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    marksLost,
    accountedMarks,
    quickStats,
    filteredTests,
    chartData,
    mistakeData,
    currentTarget
  } = useTestTracker();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-outfit relative overflow-x-hidden">
      {/* Modals */}
      <InsightModal 
        viewingReflection={viewingReflection} 
        setViewingReflection={setViewingReflection} 
      />
      
      <DeleteConfirmModal 
        confirmDeleteData={confirmDeleteData}
        setConfirmDeleteData={setConfirmDeleteData}
        handleDelete={handleDelete}
      />

      {/* Responsive Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2 justify-center md:justify-start">
              Performance <span className="bg-primary-600 text-white px-2 py-1 rounded-lg">Analyzer</span>
            </h1>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wide">
              {selectedSubject === "All" ? "Global preparation metrics" : `Focusing on ${selectedSubject} Mastery`}
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 bg-gray-50 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-gray-100 w-full md:w-auto">
            <span className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 hidden sm:inline text-nowrap">Filter Analytics:</span>
            <select 
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setPage(1);
              }}
              className="bg-white border text-[11px] md:text-sm font-bold text-primary-600 focus:ring-0 cursor-pointer rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2 w-full md:w-48 appearance-none shadow-sm"
            >
              <option value="All">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-8 space-y-6 md:space-y-8">
        
        {/* Quick Stats Grid */}
        <StatsGrid 
          quickStats={quickStats} 
          selectedSubject={selectedSubject} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 lg:col-start-1">
            <TestLogForm 
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              resetForm={resetForm}
              editingId={editingId}
              showAdvance={showAdvance}
              setShowAdvance={setShowAdvance}
              subjects={subjects}
              marksLost={marksLost}
              accountedMarks={accountedMarks}
            />
          </div>

          {/* Right Column: Analytics */}
          <div className="lg:col-span-8">
            <AnalyticsSection 
              selectedSubject={selectedSubject}
              chartData={chartData}
              currentTarget={currentTarget}
              mistakeData={mistakeData}
              stats={stats}
            />
          </div>
        </div>
          
        {/* Full Width Archive Section */}
        <SessionArchive 
          filteredTests={filteredTests}
          loading={loading}
          page={page}
          setPage={setPage}
          editingId={editingId}
          handleEdit={handleEdit}
          setConfirmDeleteData={setConfirmDeleteData}
          setViewingReflection={setViewingReflection}
        />
      </div>
    </div>
  );
};

export default TestTracker;
