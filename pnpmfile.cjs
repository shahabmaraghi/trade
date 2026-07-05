function readPackage(pkg) {
  if (pkg.name === "next" && pkg.optionalDependencies?.sharp) {
    delete pkg.optionalDependencies.sharp
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}
