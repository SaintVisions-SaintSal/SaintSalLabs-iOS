#!/usr/bin/env node
/**
 * add-app-clip.js
 * Adds SaintSalLabsClip App Clip target to the Xcode project.
 * Run: node scripts/add-app-clip.js
 */

const xcode  = require('xcode');
const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');

const PBXPROJ    = path.join(__dirname, '../ios/SaintSalLabs.xcodeproj/project.pbxproj');
const CLIP_NAME  = 'SaintSalLabsClip';
const BUNDLE_ID  = 'com.saintvision.saintsallabs.Clip';
const MAIN_UUID  = '13B07F861A680F5B00A75B9A'; // Main SaintSalLabs target
const MAIN_GROUP = '83CBB9F61A601CBA00E9B192'; // mainGroup

function uuid() {
  return crypto.randomBytes(12).toString('hex').toUpperCase();
}

const project = xcode.project(PBXPROJ);
project.parseSync();

const objs = project.hash.project.objects;

// ── Check if already added ──────────────────────────────────
const existingTargets = objs['PBXNativeTarget'] || {};
for (const key of Object.keys(existingTargets)) {
  if (typeof existingTargets[key] === 'object' && existingTargets[key].name === CLIP_NAME) {
    console.log('⚠️  App Clip target already exists — skipping.');
    process.exit(0);
  }
}

// ── Generate UUIDs ──────────────────────────────────────────
const IDs = {
  // File references
  appClipAppSwift:        uuid(),
  contentViewSwift:       uuid(),
  infoPlist:              uuid(),
  entitlements:           uuid(),
  assetsXcassets:         uuid(),
  productApp:             uuid(),

  // Build files
  appClipAppSwiftBF:      uuid(),
  contentViewSwiftBF:     uuid(),
  assetsXcassetsBF:       uuid(),

  // Group
  clipGroup:              uuid(),

  // Build phases
  sourcesBP:              uuid(),
  frameworksBP:           uuid(),
  resourcesBP:            uuid(),

  // Configs
  debugConfig:            uuid(),
  releaseConfig:          uuid(),
  configList:             uuid(),

  // Target
  clipTarget:             uuid(),

  // Embed App Clips phase in main target
  embedClipsBP:           uuid(),
  clipEmbedBF:            uuid(),
};

// ── Helper: ensure section exists ──────────────────────────
function ensureSection(name) {
  if (!objs[name]) objs[name] = {};
}
['PBXFileReference','PBXBuildFile','PBXGroup','PBXSourcesBuildPhase',
 'PBXFrameworksBuildPhase','PBXResourcesBuildPhase','PBXCopyFilesBuildPhase',
 'XCBuildConfiguration','XCConfigurationList','PBXNativeTarget'].forEach(ensureSection);

// ── 1. File References ──────────────────────────────────────
objs['PBXFileReference'][IDs.appClipAppSwift] = {
  isa: 'PBXFileReference', lastKnownFileType: 'sourcecode.swift',
  path: 'AppClipApp.swift', sourceTree: '"<group>"',
};
objs['PBXFileReference'][`${IDs.appClipAppSwift}_comment`] = 'AppClipApp.swift';

objs['PBXFileReference'][IDs.contentViewSwift] = {
  isa: 'PBXFileReference', lastKnownFileType: 'sourcecode.swift',
  path: 'ContentView.swift', sourceTree: '"<group>"',
};
objs['PBXFileReference'][`${IDs.contentViewSwift}_comment`] = 'ContentView.swift';

objs['PBXFileReference'][IDs.infoPlist] = {
  isa: 'PBXFileReference', lastKnownFileType: 'text.plist.xml',
  path: 'Info.plist', sourceTree: '"<group>"',
};
objs['PBXFileReference'][`${IDs.infoPlist}_comment`] = 'Info.plist';

objs['PBXFileReference'][IDs.entitlements] = {
  isa: 'PBXFileReference', lastKnownFileType: 'text.plist.entitlements',
  path: 'SaintSalLabsClip.entitlements', sourceTree: '"<group>"',
};
objs['PBXFileReference'][`${IDs.entitlements}_comment`] = 'SaintSalLabsClip.entitlements';

objs['PBXFileReference'][IDs.assetsXcassets] = {
  isa: 'PBXFileReference', lastKnownFileType: 'folder.assetcatalog',
  path: 'Assets.xcassets', sourceTree: '"<group>"',
};
objs['PBXFileReference'][`${IDs.assetsXcassets}_comment`] = 'Assets.xcassets';

objs['PBXFileReference'][IDs.productApp] = {
  isa: 'PBXFileReference', explicitFileType: '"wrapper.application"',
  includeInIndex: 0, path: `${CLIP_NAME}.app`, sourceTree: 'BUILT_PRODUCTS_DIR',
};
objs['PBXFileReference'][`${IDs.productApp}_comment`] = `${CLIP_NAME}.app`;

// ── 2. Build Files ──────────────────────────────────────────
objs['PBXBuildFile'][IDs.appClipAppSwiftBF] = {
  isa: 'PBXBuildFile', fileRef: IDs.appClipAppSwift,
};
objs['PBXBuildFile'][`${IDs.appClipAppSwiftBF}_comment`] = 'AppClipApp.swift in Sources';

objs['PBXBuildFile'][IDs.contentViewSwiftBF] = {
  isa: 'PBXBuildFile', fileRef: IDs.contentViewSwift,
};
objs['PBXBuildFile'][`${IDs.contentViewSwiftBF}_comment`] = 'ContentView.swift in Sources';

objs['PBXBuildFile'][IDs.assetsXcassetsBF] = {
  isa: 'PBXBuildFile', fileRef: IDs.assetsXcassets,
};
objs['PBXBuildFile'][`${IDs.assetsXcassetsBF}_comment`] = 'Assets.xcassets in Resources';

// Build file for embedding the clip in the main app
objs['PBXBuildFile'][IDs.clipEmbedBF] = {
  isa: 'PBXBuildFile', fileRef: IDs.productApp,
  settings: { ATTRIBUTES: ['RemoveHeadersOnCopy'] },
};
objs['PBXBuildFile'][`${IDs.clipEmbedBF}_comment`] = `${CLIP_NAME}.app in Embed App Clips`;

// ── 3. Group ────────────────────────────────────────────────
objs['PBXGroup'][IDs.clipGroup] = {
  isa: 'PBXGroup',
  children: [
    { value: IDs.appClipAppSwift,  comment: 'AppClipApp.swift' },
    { value: IDs.contentViewSwift, comment: 'ContentView.swift' },
    { value: IDs.assetsXcassets,   comment: 'Assets.xcassets' },
    { value: IDs.infoPlist,        comment: 'Info.plist' },
    { value: IDs.entitlements,     comment: 'SaintSalLabsClip.entitlements' },
  ],
  path: CLIP_NAME,
  sourceTree: '"<group>"',
};
objs['PBXGroup'][`${IDs.clipGroup}_comment`] = CLIP_NAME;

// Add clip group to main group children
const mainGroup = objs['PBXGroup'][MAIN_GROUP];
if (mainGroup && mainGroup.children) {
  mainGroup.children.push({ value: IDs.clipGroup, comment: CLIP_NAME });
}

// Add clip product to Products group
const productsGroup = Object.keys(objs['PBXGroup']).find(k => {
  const g = objs['PBXGroup'][k];
  return typeof g === 'object' && g.name === 'Products';
});
if (productsGroup) {
  objs['PBXGroup'][productsGroup].children.push({ value: IDs.productApp, comment: `${CLIP_NAME}.app` });
}

// ── 4. Build Phases ─────────────────────────────────────────
objs['PBXSourcesBuildPhase'][IDs.sourcesBP] = {
  isa: 'PBXSourcesBuildPhase', buildActionMask: 2147483647, runOnlyForDeploymentPostprocessing: 0,
  files: [
    { value: IDs.appClipAppSwiftBF,  comment: 'AppClipApp.swift in Sources' },
    { value: IDs.contentViewSwiftBF, comment: 'ContentView.swift in Sources' },
  ],
};
objs['PBXSourcesBuildPhase'][`${IDs.sourcesBP}_comment`] = 'Sources';

objs['PBXFrameworksBuildPhase'][IDs.frameworksBP] = {
  isa: 'PBXFrameworksBuildPhase', buildActionMask: 2147483647, runOnlyForDeploymentPostprocessing: 0,
  files: [],
};
objs['PBXFrameworksBuildPhase'][`${IDs.frameworksBP}_comment`] = 'Frameworks';

objs['PBXResourcesBuildPhase'][IDs.resourcesBP] = {
  isa: 'PBXResourcesBuildPhase', buildActionMask: 2147483647, runOnlyForDeploymentPostprocessing: 0,
  files: [
    { value: IDs.assetsXcassetsBF, comment: 'Assets.xcassets in Resources' },
  ],
};
objs['PBXResourcesBuildPhase'][`${IDs.resourcesBP}_comment`] = 'Resources';

// ── 5. Embed App Clips phase in main target ─────────────────
objs['PBXCopyFilesBuildPhase'][IDs.embedClipsBP] = {
  isa: 'PBXCopyFilesBuildPhase', buildActionMask: 2147483647,
  dstPath: '', dstSubfolderSpec: 16,
  name: '"Embed App Clips"',
  runOnlyForDeploymentPostprocessing: 0,
  files: [
    { value: IDs.clipEmbedBF, comment: `${CLIP_NAME}.app in Embed App Clips` },
  ],
};
objs['PBXCopyFilesBuildPhase'][`${IDs.embedClipsBP}_comment`] = 'Embed App Clips';

// Add embed phase to main target
const mainTarget = objs['PBXNativeTarget'][MAIN_UUID];
if (mainTarget && mainTarget.buildPhases) {
  mainTarget.buildPhases.push({ value: IDs.embedClipsBP, comment: 'Embed App Clips' });
}

// ── 6. Build Configurations ─────────────────────────────────
const commonSettings = {
  ALWAYS_SEARCH_USER_PATHS: 0,
  ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS: 'YES',
  CLANG_ANALYZER_NONNULL: 'YES',
  CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: 'YES_AGGRESSIVE',
  CLANG_CXX_LANGUAGE_STANDARD: '"gnu++20"',
  CLANG_ENABLE_MODULES: 'YES',
  CLANG_ENABLE_OBJC_ARC: 'YES',
  CLANG_WARN_BOOL_CONVERSION: 'YES',
  CLANG_WARN_CONSTANT_CONVERSION: 'YES',
  CLANG_WARN_DIRECT_OBJC_ISA_USAGE: 'YES_ERROR',
  CLANG_WARN_DOCUMENTATION_COMMENTS: 'YES',
  CLANG_WARN_EMPTY_BODY: 'YES',
  CLANG_WARN_ENUM_CONVERSION: 'YES',
  CLANG_WARN_INFINITE_RECURSION: 'YES',
  CLANG_WARN_INT_CONVERSION: 'YES',
  CLANG_WARN_NON_LITERAL_NULL_CONVERSION: 'YES',
  CLANG_WARN_OBJC_IMPLICIT_RETAIN_SELF: 'YES',
  CLANG_WARN_OBJC_LITERAL_CONVERSION: 'YES',
  CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: 'YES',
  CLANG_WARN_RANGE_LOOP_ANALYSIS: 'YES',
  CLANG_WARN_STRICT_PROTOTYPES: 'YES',
  CLANG_WARN_SUSPICIOUS_MOVE: 'YES',
  CLANG_WARN_UNREACHABLE_CODE: 'YES',
  'CLANG_WARN__DUPLICATE_METHOD_MATCH': 'YES',
  CODE_SIGN_ENTITLEMENTS: `${CLIP_NAME}/SaintSalLabsClip.entitlements`,
  CODE_SIGN_STYLE: 'Manual',
  CURRENT_PROJECT_VERSION: 1,
  DEVELOPMENT_TEAM: '2DG74QA62B',
  GCC_C_LANGUAGE_STANDARD: 'gnu17',
  GCC_WARN_64_TO_32_BIT_CONVERSION: 'YES',
  GCC_WARN_ABOUT_RETURN_TYPE: 'YES_ERROR',
  GCC_WARN_UNDECLARED_SELECTOR: 'YES',
  GCC_WARN_UNINITIALIZED_AUTOS: 'YES_AGGRESSIVE',
  GCC_WARN_UNUSED_FUNCTION: 'YES',
  GCC_WARN_UNUSED_VARIABLE: 'YES',
  GENERATE_INFOPLIST_FILE: 'NO',
  INFOPLIST_FILE: `${CLIP_NAME}/Info.plist`,
  IPHONEOS_DEPLOYMENT_TARGET: '16.0',
  LD_RUNPATH_SEARCH_PATHS: ['"$(inherited)"', '"@executable_path/Frameworks"'],
  MARKETING_VERSION: '2.0.2',
  PRODUCT_BUNDLE_IDENTIFIER: BUNDLE_ID,
  PRODUCT_NAME: '"$(TARGET_NAME)"',
  PROVISIONING_PROFILE_SPECIFIER: '',
  SWIFT_EMIT_LOC_STRINGS: 'YES',
  SWIFT_VERSION: '5.0',
  TARGETED_DEVICE_FAMILY: '"1,2"',
};

objs['XCBuildConfiguration'][IDs.debugConfig] = {
  isa: 'XCBuildConfiguration', name: 'Debug',
  buildSettings: {
    ...commonSettings,
    DEBUG_INFORMATION_FORMAT: 'dwarf',
    ENABLE_TESTABILITY: 'YES',
    GCC_DYNAMIC_NO_PIC: 'NO',
    GCC_OPTIMIZATION_LEVEL: 0,
    GCC_PREPROCESSOR_DEFINITIONS: ['"DEBUG=1"', '"$(inherited)"'],
    MTL_ENABLE_DEBUG_INFO: 'INCLUDE_SOURCE',
    ONLY_ACTIVE_ARCH: 'YES',
    SWIFT_ACTIVE_COMPILATION_CONDITIONS: 'DEBUG',
    SWIFT_OPTIMIZATION_LEVEL: '"-Onone"',
  },
};
objs['XCBuildConfiguration'][`${IDs.debugConfig}_comment`] = 'Debug';

objs['XCBuildConfiguration'][IDs.releaseConfig] = {
  isa: 'XCBuildConfiguration', name: 'Release',
  buildSettings: {
    ...commonSettings,
    COPY_PHASE_STRIP: 'NO',
    DEBUG_INFORMATION_FORMAT: '"dwarf-with-dsym"',
    ENABLE_NS_ASSERTIONS: 'NO',
    MTL_ENABLE_DEBUG_INFO: 'NO',
    SWIFT_COMPILATION_MODE: 'wholemodule',
    SWIFT_OPTIMIZATION_LEVEL: '"-O"',
    VALIDATE_PRODUCT: 'YES',
  },
};
objs['XCBuildConfiguration'][`${IDs.releaseConfig}_comment`] = 'Release';

// ── 7. Configuration List ───────────────────────────────────
objs['XCConfigurationList'][IDs.configList] = {
  isa: 'XCConfigurationList',
  buildConfigurations: [
    { value: IDs.debugConfig,   comment: 'Debug' },
    { value: IDs.releaseConfig, comment: 'Release' },
  ],
  defaultConfigurationIsVisible: 0,
  defaultConfigurationName: 'Release',
};
objs['XCConfigurationList'][`${IDs.configList}_comment`] = `Build configuration list for PBXNativeTarget "${CLIP_NAME}"`;

// ── 8. Native Target ────────────────────────────────────────
objs['PBXNativeTarget'][IDs.clipTarget] = {
  isa: 'PBXNativeTarget',
  buildConfigurationList: IDs.configList,
  buildPhases: [
    { value: IDs.sourcesBP,    comment: 'Sources' },
    { value: IDs.frameworksBP, comment: 'Frameworks' },
    { value: IDs.resourcesBP,  comment: 'Resources' },
  ],
  buildRules: [],
  dependencies: [],
  name: CLIP_NAME,
  productName: CLIP_NAME,
  productReference: IDs.productApp,
  productType: '"com.apple.product-type.application.on-demand-install-capable"',
};
objs['PBXNativeTarget'][`${IDs.clipTarget}_comment`] = CLIP_NAME;

// ── 9. Add to project targets list ─────────────────────────
const projectSection = objs['PBXProject'];
const rootObjKey = Object.keys(projectSection).find(k => typeof projectSection[k] === 'object');
if (projectSection[rootObjKey] && projectSection[rootObjKey].targets) {
  projectSection[rootObjKey].targets.push({ value: IDs.clipTarget, comment: CLIP_NAME });
}

// ── Write ────────────────────────────────────────────────────
fs.writeFileSync(PBXPROJ, project.writeSync());
console.log('✅ App Clip target added successfully!');
console.log(`   Target UUID: ${IDs.clipTarget}`);
console.log(`   Bundle ID:   ${BUNDLE_ID}`);
console.log(`   Embed phase: ${IDs.embedClipsBP}`);
