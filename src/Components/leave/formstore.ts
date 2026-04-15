import { makeAutoObservable } from "mobx";


class FormStore{
  
  formStatus:boolean=false;
  name:string="";
  email:string="";
 
  StartDate:string="";
  EndDate:string="";
  reason:string="";
  constructor(){
    makeAutoObservable(this)
  }
  setpersonalInfo(name:string,email:string ,StartDate:string,EndDate:string , reason:string ){
    this.name=name;
    this.email=email;
    this.StartDate=StartDate
    this.EndDate=EndDate
    this.reason=reason
  }
  handleFormCancel(){
  console.log("clicked on cancel")
  }

  setFormStatus(){
    console.log('inside this');
    this.formStatus=true;
  }
}
let formstore = new FormStore();
export default formstore;