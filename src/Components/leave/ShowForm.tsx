import { useFormik } from "formik";

import { observer } from "mobx-react-lite";
import styles from "./ShowForm.module.css";
import * as Yup from "yup";
import { SupabaseClient } from "../../Helper/Supabase";
import toast from "react-hot-toast";
import {  useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";


const ShowForm = () => {
  const{user}=useAuth();
  const navigate = useNavigate();

  const calculateWorkingDays  = (start : string , end:string) =>{
    if(!start||!end)return"";

    let count =0;
    let current = new Date(start);
    const last  = new Date(end);

    while(current <= last){
      const day = current.getDay();

      if(day !== 0 && day!== 6){
        count++;
      }
      current.setDate(current.getDate()+1);
    }
    return count.toString();
  }

 
  const formik = useFormik({
    initialValues: {
      startDate: "",
      endDate: "",
      total_day: "",
      reason: "",
      leave_type: "",
    },
    validationSchema: Yup.object({
      startDate: Yup.date().required("Start Date is required").min(new Date(),"Start date must be in the future"),
      endDate: Yup.date()
        .required("End Date is required")
        .test(
          "is-after-start",
          "End date must be after start date",
          function (value) {
            const { startDate } = this.parent;
            return value && startDate
              ? new Date(value) > new Date(startDate)
              : true;
          },
        ),
      total_day: Yup.string().required("Total days is required"),
      leave_type: Yup.string().required("Leave type is required"),
      reason: Yup.string().required("Reason is required"),
    }),
    onSubmit: async (values) => {
      // console.log(values);

      const { data, error } = await SupabaseClient.from("leave_types")
        .select("*")
        .eq("name", values.leave_type)
        .maybeSingle();
      if (data) {
        // console.log("data" ,data , values.leave_type );
      } else {
        console.log("error", error);
      }
      const { error: err } = await SupabaseClient.from("leave_requests").insert(
        [
          {
            user_id: user?.id,
            Name: user?.name,
            Email: user?.email,
            leave_type_id: data.id,
            department_id: user?.deptId,
            start_date: values.startDate,
            end_date: values.endDate,
            total_days: values.total_day,
            reason: values.reason,
            status: "Pending",
          },
        ],
      );
      if (err) {
        console.log("err", err);
      } else {
        toast.success("leave applied");
        navigate("/leavetable");
      }
      formik.resetForm();
    },
  });

    useEffect (()=>{
    const {startDate , endDate}  = formik.values;
    if(startDate && endDate){
      const days = calculateWorkingDays(startDate , endDate);
      formik.setFieldValue("total_day",days);
    }
   },[formik.values.startDate , formik.values.endDate]);

  return (
    <>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        <div className={styles.header}>
          <span>Leave Application</span>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label>Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formik.values.startDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.startDate && formik.errors.startDate && (
              <span className={styles.error}>{formik.errors.startDate}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label>End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formik.values.endDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.endDate && formik.errors.endDate && (
              <span className={styles.error}>{formik.errors.endDate}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label>Total Days</label>
            <input
              type="text"
              name="total_day"
              value={formik.values.total_day}
              readOnly
            />
            {formik.touched.total_day && formik.errors.total_day && (
              <span className={styles.error}>{formik.errors.total_day}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label>Leave Type</label>
            <select
              name="leave_type"
              value={formik.values.leave_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select leave type</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>

            {formik.touched.leave_type && formik.errors.leave_type && (
              <span className={styles.error}>{formik.errors.leave_type}</span>
            )}
          </div>

          <div className={styles.inputGroupFull}>
            <label>Reason</label>
            <textarea
              name="reason"
              placeholder="Enter your reason..."
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.reason && formik.errors.reason && (
              <span className={styles.error}>{formik.errors.reason}</span>
            )}
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Apply Leave
        </button>
      </form>
    </>
  );
};

export default ShowForm;
