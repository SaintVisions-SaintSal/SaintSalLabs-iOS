const { withProjectBuildGradle } = require('expo/config-plugins');

/**
 * Forces the Compose Compiler to accept Kotlin 1.9.24 by adding
 * suppressKotlinVersionCompatibilityCheck as a free compiler arg
 * to ALL Kotlin compile tasks project-wide.
 * 
 * Uses subprojects {} with tasks.whenTaskAdded to avoid the
 * "Cannot run Project.afterEvaluate when project is already evaluated" error.
 */
function withKotlinFix(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    
    if (!contents.includes('suppressKotlinVersionCompatibilityCheck')) {
      // Use gradle.projectsEvaluated to run AFTER all projects are evaluated
      // This avoids the "already evaluated" error while still affecting all subprojects
      const fix = `
// Fix: Suppress Compose Compiler Kotlin version check (1.9.24 vs 1.9.25)
gradle.projectsEvaluated {
    subprojects {
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
