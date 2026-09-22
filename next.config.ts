import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir la demo por Wi-Fi (LAN). Sin esto Next bloquea /_next/*
  // y el login no hidrata: el form hace GET y parece que "no funciona".
  allowedDevOrigins: ["192.168.0.251"],
};

export default nextConfig;
