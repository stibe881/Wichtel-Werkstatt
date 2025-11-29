export const getWeather = () => {
  const date = new Date();
  const day = date.getDate();
  // Deterministic "random" based on day to ensure it stays same for the day
  const tempBase = -20;
  const tempVar = (day * 13) % 15; 
  const temp = tempBase + (day % 2 === 0 ? tempVar : -tempVar);
  
  const conditions = ['Schneesturm', 'Klarer Sternenhimmel', 'Leichter Schneefall', 'Eisiger Wind', 'Nordlicht-Leuchten'];
  const condition = conditions[day % conditions.length];

  return { temp, condition };
};