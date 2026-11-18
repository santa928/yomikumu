export default function Fields({ values }) {
  return <>
    <label>架空の表示名 <input name="reader" defaultValue={values.alias} /></label>
    <label>人数 <input name="seats" inputMode="numeric" defaultValue={values.seats} /></label>
  </>;
}
