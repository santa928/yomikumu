export function validateRegistration(values) {
  if (!values.alias.trim()) return "表示名を入力してください。";
  if (!/^\d+$/.test(values.seats.trim())) return "人数は1〜3の整数を入力してください。";
  return "";
}
