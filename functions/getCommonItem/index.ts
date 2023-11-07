export default function getCommonItem<T>(arr1: T[], arr2: T[]) {
  const set = new Set(arr1)

  for (const item of arr2) {
    if (set.has(item)) {
      return item
    }
  }
}
