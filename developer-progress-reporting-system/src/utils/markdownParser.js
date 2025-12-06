export function parseProgress(markdown) {
  const phases = [];
  let overallCompletion = 0;
  
  const phaseRegex = /\|\s*Phase\s+\d+[^|]*\|\s*([^|]+)\s*\|\s*(\d+)%\s*\|/g;
  let match;
  while ((match = phaseRegex.exec(markdown)) !== null) {
    const status = match[1].trim();
    const percentage = parseInt(match[2]);
    const phaseMatch = match[0].match(/Phase\s+\d+[^|]*/);
    const phaseName = phaseMatch ? phaseMatch[0].trim() : 'Unknown';
    
    phases.push({
      name: phaseName,
      status: status.includes('✅') || status.includes('Complete') ? 'Complete' : 'In Progress',
      percentage: percentage
    });
    
    overallCompletion += percentage;
  }
  
  const upcomingRegex = /\*\*Phase\s+\d+[^:]*:\s*([^*]+)\s*\((\d+)%\)\*\*/g;
  while ((match = upcomingRegex.exec(markdown)) !== null) {
    const phaseName = match[1].trim();
    const percentage = parseInt(match[2]);
    
    phases.push({
      name: phaseName,
      status: 'Pending',
      percentage: percentage
    });
    
    overallCompletion += percentage;
  }
  
  if (phases.length > 0) {
    overallCompletion = Math.round(overallCompletion / phases.length);
  }
  
  const overallMatch = markdown.match(/Overall Completion[:\s]*(\d+)%/i);
  if (overallMatch) {
    overallCompletion = parseInt(overallMatch[1]);
  }
  
  return { phases, overallCompletion };
}

