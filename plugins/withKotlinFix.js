const { withProjectBuildGradle } = require('expo/config-plugins');

/**
 * Forces the Compose Compiler to accept Kotlin 1.9.24 by adding
 * suppressKotlinVersionCompatibilityCheck as a free compiler arg
 * to ALL Kotlin compile tasks project-wide.
 */
function withKotlinFix(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    
    if (!contents.includes('suppressKotlinVersionCompatibilityCheck')) {
      // Append to root build.gradle — applies to ALL subprojects including expo-modules-core
      const fix = `
// Fix: Suppress Compose Compiler Kotlin version check (1.9.24 vs 1.9.25)
subprojects {
    afterEvaluate {
        tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
            kotlinOptions {
                freeCompilerArgs += [
                    "-P",
                    "plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=1.9.24"
                ]
            }
        }
    }
}
`;
      config.modResults.contents = contents + fix;
    }
    
    return config;
  });
}

module.exports = withKotlinFix;
