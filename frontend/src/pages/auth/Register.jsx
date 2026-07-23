import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Register() {
  const { register: registerField, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'student' }
  });
  const { register } = useAuth();
  
  const selectedRole = watch('role');

  const onSubmit = (data) => {
    register(data);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Create an account</h2>
          <p className="text-sm text-slate-600 mt-2">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col space-y-1 mb-4">
            <label className="text-sm font-medium text-slate-700">I am a...</label>
            <select
              {...registerField("role")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">Student (Customer)</option>
              <option value="vendor">Stall Vendor (Owner)</option>
            </select>
          </div>

          {selectedRole === 'student' && (
            <Input
              label="Registration Number"
              id="registration_number"
              {...registerField("registration_number", { required: "Registration number is required" })}
              error={errors.registration_number}
            />
          )}

          {selectedRole === 'vendor' && (
            <>
              <Input
                label="Email Address"
                id="email"
                type="email"
                {...registerField("email", { required: "Email is required" })}
                error={errors.email}
              />
              <Input
                label="Vendor / Stall Name"
                id="vendor_name"
                {...registerField("vendor_name", { required: "Vendor name is required" })}
                error={errors.vendor_name}
              />
            </>
          )}
          
          <Input
            label={selectedRole === 'vendor' ? "Owner Name" : "Full Name"}
            id="full_name"
            {...registerField("full_name", { required: "Name is required" })}
            error={errors.full_name}
          />

          <Input
            label="Phone Number"
            id="phone_number"
            {...registerField("phone_number", { required: "Phone number is required" })}
            error={errors.phone_number}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            {...registerField("password", { 
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" }
            })}
            error={errors.password}
          />

          <Button type="submit" className="w-full mt-6">
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
