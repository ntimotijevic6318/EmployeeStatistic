import {AfterViewInit, Component, OnInit} from '@angular/core';
import {environment} from "../enviroments/environment";
import {HttpClient} from "@angular/common/http";
import {Employee} from "../models/Employee";
import {Chart, Plugin} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit , AfterViewInit {
  title = 'employee_statistic';

  private readonly postAPI = environment.postApi;
  private readonly keyAPI = "vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==";
  public employeeARRAY: Employee[] = [];
  public StartTimeUtc: String
  public EndTimeUtc: String

  colors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E'];

  public pieChartLabels : Array<any> = [];

  public pieChartOptions : any = {
    responsive: true ,
    plugins : {
      datalabels : {

      }
    }
  };


  totalHours : number = 0;

  public pieChartLegend : boolean = true;

  pieType: any = 'pie';

  public pieChartData : Array<any> = [
    {data: [] ,  backgroundColor: this.colors , borderColor: 'black', borderWidth: 2}
  ];


  constructor(private fetcher: HttpClient) {
    this.StartTimeUtc = '';
    this.EndTimeUtc = '';
  }

  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    Chart.defaults.set('plugins.datalabels', {
      color: 'black'
    });
    this.fetchData();
  }

  //fetching data from API
  private fetchData() {
    this.fetcher.get<Employee[]>(`${this.postAPI}?code=${this.keyAPI}`).subscribe(
      (response) => {
        this.employeeARRAY = response;
        this.reduceList()
      }
    )
  }



 //reducing list(removing duplicates)
  private reduceList() {

    //Deleting empty fields
    for (let i = 0; i < this.employeeARRAY.length; i++) {
      if (this.employeeARRAY[i].EmployeeName == null) {
        this.employeeARRAY.splice(this.employeeARRAY.indexOf(this.employeeARRAY[i]), 1);
      }
    }


    for (let i = 0; i < this.employeeARRAY.length - 1; i++) {
      this.employeeARRAY[i].time = 0;
      for (let j = i + 1; j < this.employeeARRAY.length; j++) {
        if (this.employeeARRAY[i].EmployeeName == this.employeeARRAY[j].EmployeeName) {
          const StarTimeUtc = this.employeeARRAY[j].StarTimeUtc;
          const EndTimeUtc = this.employeeARRAY[j].EndTimeUtc;
          this.calculateHoursWorked(this.employeeARRAY[i], StarTimeUtc, EndTimeUtc);
          this.employeeARRAY.splice(this.employeeARRAY.indexOf(this.employeeARRAY[j]), 1);
          j--;
        }
      }
    }

    //sorting list with BubbleSort
    this.sortListByWorkingHours(this.employeeARRAY);



    //Making pie
    for(let i=0 ; i<this.employeeARRAY.length ;i++){
      this.totalHours+= this.employeeARRAY[i].time;
      this.pieChartLabels.push(this.employeeARRAY[i].EmployeeName);
    }


    for(let i = 0 ; i  < this.employeeARRAY.length ; i++) {
      let num = ((this.employeeARRAY[i].time / this.totalHours) * 100);
      this.pieChartData[0].data.push(num.toFixed(1))
    }

  }

  private sortListByWorkingHours(employeeARRAY: Employee[]) {

    let length = this.employeeARRAY.length;
    for (let i = 0; i < length - 1; i++)
      for (let j = 0; j < length - i - 1; j++)
        if (this.employeeARRAY[j].time < this.employeeARRAY[j + 1].time) {
          let temp = this.employeeARRAY[j];
          this.employeeARRAY[j] = this.employeeARRAY[j + 1]
          this.employeeARRAY[j + 1] = temp;
        }
  }

  //Calculating time worked
  private calculateHoursWorked(employee: Employee, StartTimeUtc: string, EndTimeUtc: string) {

    if (employee.time == 0) {
      employee.time = this.calulateDiffHours(new Date(employee.EndTimeUtc), new Date(employee.StarTimeUtc))
    }

    let d1 = new Date(StartTimeUtc);
    let d2 = new Date(EndTimeUtc);
    employee.time += this.calulateDiffHours(d2, d1)
  }

  private calulateDiffHours(d1: Date, d2: Date) {
    var diff = (d1.getTime() - d2.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(Math.floor(diff));
  }

  //After view init



  ngAfterViewInit(): void {

  }
}
