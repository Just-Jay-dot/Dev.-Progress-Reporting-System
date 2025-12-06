// Document Service - Handles reading and writing BLUEPRINT.md and PROGRESS.md
// This service enables the AI chat to create and update documentation files

/**
 * Read a documentation file
 */
export async function readDocument(filename) {
  try {
    const response = await fetch(`/api/files/read/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to read ${filename}`);
    }
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw error;
  }
}

/**
 * Write a documentation file
 */
export async function writeDocument(filename, content) {
  try {
    const response = await fetch(`/api/files/write/${filename}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to write ${filename}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

/**
 * Get full project context (both files)
 */
export async function getFullProjectContext() {
  try {
    const [blueprint, progress] = await Promise.all([
      readDocument('BLUEPRINT.md').catch(() => ''),
      readDocument('PROGRESS.md').catch(() => ''),
    ]);
    
    return {
      blueprint,
      progress,
      hasBlueprint: blueprint.length > 0,
      hasProgress: progress.length > 0,
    };
  } catch (error) {
    console.error('Error getting project context:', error);
    return {
      blueprint: '',
      progress: '',
      hasBlueprint: false,
      hasProgress: false,
    };
  }
}

/**
 * Check if project is initialized (has blueprint and progress)
 */
export async function isProjectInitialized() {
  try {
    const context = await getFullProjectContext();
    return context.hasBlueprint && context.hasProgress;
  } catch {
    return false;
  }
}

