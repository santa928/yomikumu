const spring = [
  { id: "river", title: "川辺の読書会", town: "港", seats: 2 },
  { id: "hill", title: "丘の読書会", town: "坂", seats: 0 },
  { id: "bridge", title: "橋の読書会", town: "港", seats: 1 },
];
const autumn = [
  { id: "river", title: "夕方の詩の会", town: "坂", seats: 0 },
  { id: "lamp", title: "灯りの会", town: "港", seats: 4 },
];

export function meetingsFor(edition) {
  return edition === "autumn" ? autumn : spring;
}
