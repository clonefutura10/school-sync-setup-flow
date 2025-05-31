
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SchoolSetupWizard } from "@/components/SchoolSetupWizard";

const Setup = () => {
  return (
    <ProtectedRoute>
      <SchoolSetupWizard />
    </ProtectedRoute>
  );
};

export default Setup;
