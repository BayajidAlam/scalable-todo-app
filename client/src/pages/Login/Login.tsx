import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import { loginSchema } from "../../schemas/login";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Form } from "../../components/ui/form";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { AuthContext } from "../../providers/AuthProvider";

const Login = () => {
  // @ts-ignore
  const { logInUser, loading } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    console.log(data, "user data");
    try {
      logInUser(data.email, data.password)
        .then((result: any) => {
          if (result?.user?.email) {
            toast.success("Successfully logged in!", {
              position: "top-right",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
            });
            navigate(from, { replace: true });
          }
        })
        .catch((error: any) => {
          toast.error(`${error?.message}`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        });
    } catch (error) {
      console.log(error, "error");
    }
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">User Name</Label>
                  <Input
                    id="email"
                    placeholder="john doe"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="******"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit">
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
            <p className="my-2 text-center">
              New to Mahlun
              <Link className="font-semibold" to="/registration">
                ?Create account
              </Link>
            </p>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;