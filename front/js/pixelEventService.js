import {isBefore, parseISO} from 'date-fns';


export async function getAllPixelEvent() {
  const res = await fetch('pixel-events.json');
  return res.json();
}

export function addOrUpdatePixelInFlag(flagArray, pixel, indexInFlagToLocalIndexMap) {
  const localIndex = indexInFlagToLocalIndexMap[pixel.indexInFlag];
  if (localIndex == null) {
    flagArray.push(pixel);
    indexInFlagToLocalIndexMap[pixel.indexInFlag] = flagArray.length - 1;
  } else {
    flagArray[localIndex] = pixel;
  }
}

export function applyGivenEventsNumberToFlagFromIndex(flagArray, indexInFlagToLocalIndexMap, eventArray, fromEventNumber = 0, eventToApply = 0) {
  let i = fromEventNumber;
  let appliedEvent = 0;
  while (eventArray[i] && appliedEvent < eventToApply) {
    const actualEvent = eventArray[i];
    addOrUpdatePixelInFlag(flagArray, actualEvent.data, indexInFlagToLocalIndexMap);
    appliedEvent++;
    i++;
  }
}

export function applyEventToFlagFromIndexUntilDate(flagArray, indexInFlagToLocalIndexMap, eventArray, fromEventNumber = 0, untilDate) {
  let i = fromEventNumber;
  let actualEvent = eventArray[i];
  while (eventArray[i] && isBefore(parseISO(actualEvent.createdAt.$date), untilDate)) {
    actualEvent = eventArray[i];
    addOrUpdatePixelInFlag(flagArray, actualEvent.data, indexInFlagToLocalIndexMap);
    i++;
  }
  return i;
}
