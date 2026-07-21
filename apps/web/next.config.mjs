/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth",
        permanent: false,
      },
      {
        source: "/login/:path*",
        destination: "/auth",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
