import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "./Signup.module.css";
import { SupabaseClient } from "../../Helper/Supabase";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const SignUp = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      name: "",
      phoneNumber: "",
      email: "",
      password: "",
      role: "",
      department: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, "Name must be at least 3 character")
        .required("Name is required"),
      phoneNumber: Yup.string()
        .required("Phone number is required")
        .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
      email: Yup.string()
        .email("Invalid email format (example:- test@gmail.com)")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      role: Yup.string().required("Role is required"),
      department: Yup.string().required("Department is required"),
    }),
    onSubmit: async (values) => {
      try {
        const { data, error } = await SupabaseClient.auth.signUp({
          email: values.email,
          password: values.password,
        });


        if (error) {
          toast.error(error.message);
          return;
        }
        await SupabaseClient.auth.signOut();
        const userId = data?.user?.id;
        if (!userId) {
          toast.error("Signup failed, try again.");
          return;
        }

        const { data: roleData } = await SupabaseClient.from(
          "roles",
        )
          .select("id")
          .eq("emprole", values.role)
          .maybeSingle();
        
          if(!roleData){
            toast.error("Role not found");
            return;
          }

        const { data: deptData } =
          await SupabaseClient.from("departments")
            .select("id")
            .eq("empDepartment",values.department)
            .maybeSingle();
        
            if(!deptData){
              toast.error("Department not found");
              return;
            }

        const { data: profileData } =
          await SupabaseClient.from("profiles")
            .insert([
              {
                id: userId,
                full_name: values.name,
                phone: values.phoneNumber,
                role_id: roleData.id,
                department_id: deptData.id,
                Email: values.email,
              },
            ])
            .select()
            .single();
          if(!profileData){
              toast.error("Profile creation failed");
              return;
            }
        toast.success("Signup successful!");
          navigate("/login");
     
      } catch (err) {
        console.error(err);
        toast.error("something went wrong");
      }
    },
  });
  return (
    <div className={styles.container}>
      <form onSubmit={formik.handleSubmit} className={styles.form}>
        <h2 className={styles.title}>SignUp</h2>
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={styles.input}
        ></input>
        {formik.touched.name && formik.errors.name && (
          <div className={styles.error}>{formik.errors.name}</div>
        )}

        <label htmlFor="phoneNumber" className={styles.label}>
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="number"
          name="phoneNumber"
          placeholder="Enter your PhoneNumber"
          value={formik.values.phoneNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={styles.input}
        ></input>
        {formik.touched.phoneNumber && formik.errors.phoneNumber && (
          <div className={styles.error}>{formik.errors.phoneNumber}</div>
        )}
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={styles.input}
        ></input>
        {formik.touched.email && formik.errors.email && (
          <div className={styles.error}>{formik.errors.email}</div>
        )}
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formik.values.password}
          onChange={formik.handleChange}
          className={styles.input}
          onBlur={formik.handleBlur}
        ></input>
        {formik.touched.password && formik.errors.password && (
          <div className={styles.error}>{formik.errors.password}</div>
        )}

        <label htmlFor="department" className={styles.label}>
          Department
        </label>
        <select
          id="department"
          name="department"
          value={formik.values.department}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={styles.input}
        >
          <option value="">Select Department</option>
          <option value="TechOps">TechOps</option>
          <option value="NetInfa">NetInfa</option>
          <option value="AppDev">AppDev</option>
          <option value="DevOps">DevOps</option>
          <option value="DataLab">DataLab</option>
          <option value="CloudSVc">CloudSVc</option>
          <option value="ITStrac">ITStrac</option>
          <option value="DigSol">DigSol</option>
          <option value="HR">HR</option>
        </select>
        {formik.touched.department && formik.errors.department && (
          <div className={styles.error}>{formik.errors.department}</div>
        )}

        <label htmlFor="role" className={styles.label}>
          Role
        </label>
        <select
          id="role"
          name="role"
          value={formik.values.role}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={styles.input}
        >
          <option value="">Select Role</option>
          <option value="Software Developer">Software Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Full Stack">Full Stack</option>
          <option value="DevOps">DevOps</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Technical supporter">Technical supporter</option>
          <option value="Business Analyst">Business Analyst</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="UI Designer">UI Designer</option>
        </select>
        {formik.touched.role && formik.errors.role && (
          <div className={styles.error}>{formik.errors.role}</div>
        )}

        <button type="submit" className={styles.button}>
          Submit
        </button>
        
      </form>
    </div>
  );
};

export default SignUp;
