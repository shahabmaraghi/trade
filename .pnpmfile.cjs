function readPackage(pkg) {
  if (
    pkg.name === "sharp" ||
    pkg.name === "mongodb-memory-server" ||
    pkg.name === "mongodb-memory-server-core"
  ) {
    delete pkg.scripts
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}
