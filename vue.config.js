module.exports = {
  publicPath:
    process.env.NODE_ENV === "production"
      ? "//cdn.yanjd.top/ziju/admin/static/"
      : "/",
  devServer: {
    host: "localhost",
    port: 9810,
    https: false,
    open: true,
    hotOnly: true,
    proxy: {
      "/api": {
        target: "http://localhost:9800",
        changeOrigin: true
      }
    }
  }
};
