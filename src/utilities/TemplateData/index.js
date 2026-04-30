const templateData = [
  {
    srNo: 1,
    township: "Tarang",
    plotType: "Shop",
    plotNo: 23,
    sqMtr: 150,
    sqYard: 179,
    salableSize: 160,
    road: "Main Road",
    facing: "North - West",
    corner: "YES",
    tPoint: "NO",
    tapper: "NO",
    plotShape: "Corner",
    remark: "Kindly remove this test data before using the template data",
    remarkPlotStatus: "Available",
  }
];

const templateColumns = [
  { header: "Sr No.", key: "srNo" },
  { header: "Township", key: "township" },
  { header: "Plot Type", key: "plotType" },
  { header: "Plot No.", key: "plotNo" },
  { header: "Sq. Mtr.", key: "sqMtr" },
  { header: "Sq. Yard", key: "sqYard" },
  { header: "Salable Size", key: "salableSize" },
  { header: "Road", key: "road" },
  { header: "Facing", key: "facing" },
  { header: "Corner (Yes/No)", key: "corner" },
  { header: "T-Point (Yes/No)", key: "tPoint" },
  { header: "Tapper (Yes/No)", key: "tapper" },
  { header: "Plot Shape", key: "plotShape" },
  { header: "Remark", key: "remark" },
  { header: "Remark Plot Status", key: "remarkPlotStatus" },
];


export { templateColumns, templateData };