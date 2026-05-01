"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Octokit } from "@octokit/rest";
import Particles from "../components/Particles"; // adjust path if needed

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  const handleGoogleLogin = (response: any) => {
    console.log("Google Login Success:", response);
  };

  const handleGitHubLogin = async () => {
    const clientId = "your_github_client_id";
    const redirectUri = "your_redirect_uri";
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;
    window.location.href = githubAuthUrl;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-between bg-gradient-to-br from-[#0a0a1f] via-[#1a103f] to-[#000000] text-white">
      {/* 🌌 Animated Particle Background */}
      <Particles
        particleCount={250}
        particleSpread={10}
        speed={0.2}
        particleColors={["#ffffff", "#a1c4fd", "#c2e9fb"]}
        moveParticlesOnHover={false}
        alphaParticles
        particleBaseSize={90}
        sizeRandomness={1}
        cameraDistance={15}
        className="absolute inset-0 z-0"
      />

      {/* 🪐 Login Card */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-lg bg-white/10 text-white p-10 rounded-2xl shadow-2xl flex flex-col w-[420px] border border-white/20"
        >
          <h2 className="text-2xl font-bold mb-6 text-center tracking-wide">
            Welcome Aboard, Commander 🚀
          </h2>

          <label htmlFor="email" className="text-sm mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 mb-3 rounded bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder-gray-300"
            placeholder="Enter your email"
          />

          <label htmlFor="password" className="text-sm mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-2 mb-2 rounded bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder-gray-300"
            placeholder="Enter your password"
          />

          {/* Forgot Password */}
          <div className="flex justify-end mb-5">
            <button
              type="button"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              onClick={() => console.log("Forgot password clicked")}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition"
          >
            Launch
          </button>

          <div className="mt-5 text-center space-y-2">
            <button
              type="button"
              onClick={handleGitHubLogin}
              className="w-full py-2 bg-gray-900 hover:bg-gray-700 rounded transition"
            >
              Login with GitHub
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
            >
              Login with Google
            </button>
          </div>

          {/* Divider */}
          <div className="my-5 border-t border-white/20"></div>

          {/* Create Account */}
          <p className="text-sm text-center text-gray-300">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => console.log("Navigate to sign-up")}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              Create one
            </button>
          </p>
        </form>
      </div>

      {/* 🌠 Footer */}
      <footer className="relative z-10 w-full px-6 pb-4 flex flex-col md:flex-row items-center justify-between text-gray-400 text-xs md:text-sm">
        {/* Left: Privacy & Terms */}
        <div className="flex space-x-4 mb-2 md:mb-0">
          <button className="hover:text-indigo-400 transition">Privacy</button>
          <p>•</p>
          <button className="hover:text-indigo-400 transition">Terms</button>
        </div>

        {/* Center: Quote */}
        {/* <p className="text-center text-gray-300 max-w-md leading-relaxed text-xs md:text-sm">
          “Every orbit begins with your return. Let’s build something stellar —
          together.”
          <br />
          <span className="text-indigo-400 font-medium">
            — Team Vocter Lab 🚀
          </span>
        </p> */}
        <p className="text-center text-gray-300 text-xs md:text-sm whitespace-nowrap">
          Every orbit begins with your return. Let’s build something stellar
          together.
          <br />
          <span className="text-indigo-400 font-medium">
            Team Vecter Lab 🚀
          </span>
        </p>

        {/* Right: Powered by Nova */}
        <div className="mt-2 md:mt-0">
          <span>
            Powered by{" "}
            <span className="text-indigo-400 font-semibold hover:text-indigo-300 transition">
              Nova
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
