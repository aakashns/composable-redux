const ACTION_PREFIX = "@@dextrous/";

/** Prefix an action type to avoid collisions */
export const actionType = str => ACTION_PREFIX + str;
