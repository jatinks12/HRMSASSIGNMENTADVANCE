import { useNavigate } from "react-router-dom";
import styles from "./leave.module.css";
import { useAuth } from "../../Context/AuthContext";



const Leave = ()=> {
  const{permissions}=useAuth();
  
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h2>Leave Management</h2>

      <div className={styles.cardContainer}>
        
       { permissions.applyLeave &&<div
          className={styles.card} 
          onClick={() => navigate("/applyleave")}
        >
          <h3>Apply Leave</h3>
        </div>}

       {permissions.approveLeave && <div
          className={styles.card}
          onClick={() => navigate("/approveleave")}
        >
          <h3>Approve Leave</h3>
        </div>}

     {permissions.leaveTable &&   <div
          className={styles.card}
          onClick={() => navigate("/leavetable")}
        >
          <h3>View Leave Table</h3>
        </div>}

      </div>
    </div>
  );
};

export default Leave;