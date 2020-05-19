export default class PositionReportService {
  positionReports = [];

  getPositionReports() {
    return this.positionReports;
  }

  updatePositionReports(positionReport) {
    const positionReportFoundIndex = this.positionReports.findIndex(e => e.PositionID === positionReport.PositionID);
    if (positionReportFoundIndex > -1) {
      if (this.getQty(positionReport).LongQty === 0 || this.getQty(positionReport).ShortQty === 0) {
        this.positionReports.splice(positionReportFoundIndex, 1);
      } else {
        this.positionReports[positionReportFoundIndex] = positionReport;
      }
    } else {
      this.positionReports.push(positionReport);
    }
  }

  getQty(p) {
    return p.PositionQty.find(p => p.PosType === "TotalTransactionQty");
  };

}
