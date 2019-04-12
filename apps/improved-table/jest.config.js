module.exports = {
  name: "improved-table",
  preset: "../../jest.config.js",
  coverageDirectory: "../../coverage/apps/improved-table/",
  snapshotSerializers: [
    "jest-preset-angular/AngularSnapshotSerializer.js",
    "jest-preset-angular/HTMLCommentSerializer.js"
  ]
};
