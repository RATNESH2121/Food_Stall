import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Register() {
  const { register: registerField, handleSubmit, formState: { errors } } = useForm();
  const { register } = useAuth();

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
          <Input
            label="Registration Number"
            id="registration_number"
            {...registerField("registration_number", { required: "Registration number is required" })}
            error={errors.registration_number}
          />
          
          <Input
            label="Full Name"
            id="full_name"
            {...registerField("full_name", { required: "Full name is required" })}
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
