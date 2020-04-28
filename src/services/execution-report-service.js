
export default class ExecutionReportService {
  executionReports = [];

  updateExecutionReport(execReport) {
    console.log(execReport);
    const execReportFoundIndex = this.executionReports.findIndex(e => e.OrderID === execReport.OrderID);
    if (execReportFoundIndex > -1) {
      if (execReport.ExecType === "Canceled") {
        this.executionReports.splice(execReportFoundIndex, 1);
      } else {
        this.executionReports[execReportFoundIndex] = execReport;
      }
    } else {
      this.executionReports.push(execReport);
    }
  }

  getExecutionReports() {
    return this.executionReports;
  }

  getWorkingOrders() {
    return this.executionReports.filter(e => e.WorkingIndicator === "Working");
  }

}
