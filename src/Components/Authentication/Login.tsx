import { useFormik } from "formik";
import styles from "./Login.module.css";
import *as Yup from "yup"
import { SupabaseClient } from "../../Helper/Supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const Login = () => {
  const navigate= useNavigate();

  useEffect(()=>{
    console.log("we arrive here ")
  },[])
  const formik = useFormik({
    initialValues: {
      email: "",
      password:"",
    },
    validationSchema:Yup.object({
      email:Yup.string().email("Invalid email format (example:-> test@gmail.com").required("Email is required"),
      password:Yup.string().min(6,"password must be atleast 6 chracter").required("password is required")
    }),
    onSubmit: async(values) => {
      try{
        const{data,error} = await SupabaseClient.auth.signInWithPassword({
          email:values.email,
          password:values.password,
        })
        if(error){
          toast.error(error.message);
        }else{
         
            toast.success("Login successful!");
            navigate("/");
        
        }
      }catch(err){
        console.error(err);
      }
    },
  });
  return (
    <div className={styles.container}>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Login</h2>
       
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
         id="email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={formik.values.email}
          onChange={formik.handleChange}
          className={styles.input}
          onBlur={formik.handleBlur}
        ></input>
        {formik.touched.email && formik.errors.email &&<div className={styles.error}>{formik.errors.email}</div>}
         <label htmlFor="password" className={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={formik.values.password}
          onChange={formik.handleChange}
          className={styles.input}
          onBlur={formik.handleBlur}
        ></input>
         {formik.touched.password && formik.errors.password &&<div className={styles.error}>{formik.errors.password}</div>}
        <button type="submit" className={styles.button}>Submit</button>
     
      </form>
    </div>
  );
};

export default Login;
