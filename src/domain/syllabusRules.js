/**
 * Syllabus Hierarchy Rules
 * Matches backend rules in src/utils/syllabusRules.js
 */

export const SYLLABUS_HIERARCHY = {
    root: "category",
    category: "subject",
    subject: "topic",
    topic: "subtopic",
    subtopic: "micro-topic",
    "micro-topic": null, // Leaf nodes
};

/**
 * Returns the valid child type for a given parent type.
 * @param {string} parentType 
 * @returns {string|null}
 */
export const getChildType = (parentType) => {
    return SYLLABUS_HIERARCHY[parentType] || null;
};
