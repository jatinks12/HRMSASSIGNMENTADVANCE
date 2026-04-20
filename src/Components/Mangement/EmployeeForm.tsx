import React from "react";
import { Dialog } from "primereact/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SupabaseClient } from "../../Helper/Supabase";
import toast from "react-hot-toast";
import { Button } from "primereact/button";
import type { Employee } from "./Management";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: Employee | null; 
};

const EmployeeForm: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {

  const formik = useFormik({
    enableReinitialize: true,
   initialValues: {
    name: initialData?.Name || "",
    phoneNumber: initialData?.phone || "",
    email: initialData?.Email || "",
    password: "",
    role: initialData?.role || "",
    department: initialData?.department || "",
  },

    validationSchema: Yup.object({
      name: Yup.string().min(3).required("Name required"),
      phoneNumber: Yup.string()
        .matches(/^[0-9]{10}$/, "10 digit phone required")
        .required("Phone required"),
      email: Yup.string().email().required("Email required"),
     password: initialData
  ? Yup.string()
  : Yup.string().min(6).required("Password required"),
      role: Yup.string().required("Role required"),
      department: Yup.string().required("Department required"),
    }),

    onSubmit: async (values) => {
  try {
    // 🔁 EDIT MODE
    if (initialData?.id) {
      const { error } = await SupabaseClient
        .from("profiles")
        .update({
          full_name: values.name,
          phone: values.phoneNumber,
          // optional:
          // role: values.role,
          // department: values.department,
        })
        .eq("id", initialData.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Employee Updated ✅");

      onSave({
        id: initialData.id,
        Name: values.name,
        Email: values.email,
        phone: values.phoneNumber,
        role: values.role,
        department: values.department,
      });

      onClose();
      return;
    }

    // ➕ ADD MODE
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
      toast.error("Signup failed");
      return;
    }

    const { error: profileError } = await SupabaseClient
      .from("profiles")
      .insert([
        {
          id: userId,
          full_name: values.name,
          phone: values.phoneNumber,
          Email: values.email,
        },
      ]);

    if (profileError) {
      toast.error(profileError.message);
      return;
    }

    toast.success("Employee Added ✅");

    onSave({
      id: userId,
      Name: values.name,
      Email: values.email,
      phone: values.phoneNumber,
      role: values.role,
      department: values.department,
    });

    onClose();

  } catch (err) {
    toast.error("Something went wrong");
  }

  },});

  return (
    <Dialog
    header={initialData ? "Edit Employee" : "Add Employee"}
      visible={visible}
      style={{ width: "450px" }}
      onHide={onClose}
    >
      <form onSubmit={formik.handleSubmit} className="p-fluid">

        <input
          name="name"
          placeholder="Name"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        {formik.errors.name && <small className="p-error">{formik.errors.name}</small>}

        <input
          name="phoneNumber"
          placeholder="Phone"
          value={formik.values.phoneNumber}
          onChange={formik.handleChange}
        />
        {formik.errors.phoneNumber && <small className="p-error">{formik.errors.phoneNumber}</small>}

       <input
  name="email"
  placeholder="Email"
  value={formik.values.email}
  onChange={formik.handleChange}
  disabled={!!initialData}
/>
        {formik.errors.email && <small className="p-error">{formik.errors.email}</small>}

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
        />
        {formik.errors.password && <small className="p-error">{formik.errors.password}</small>}

        <select name="department" value={formik.values.department} onChange={formik.handleChange}>
          <option value="">Select Department</option>
          <option value="TechOps">TechOps</option>
          <option value="HR">HR</option>
        </select>
        {formik.errors.department && <small className="p-error">{formik.errors.department}</small>}

        <select name="role" value={formik.values.role} onChange={formik.handleChange}>
          <option value="">Select Role</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
        </select>
        {formik.errors.role && <small className="p-error">{formik.errors.role}</small>}

        <div style={{ marginTop: 15 }}>
          <Button label="Submit" type="submit" />
          <Button
            label="Cancel"
            className="p-button-secondary"
            onClick={onClose}
          />
        </div>

      </form>
    </Dialog>
  );
};

export default EmployeeForm;