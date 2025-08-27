import subprocess
import secrets
import string
import sys
import os

def run_command(command, error_message):
    try:
        result = subprocess.run(command, check=True, text=True, capture_output=True)
        print(result.stdout.strip())
    except subprocess.CalledProcessError as e:
        print(f"{error_message}:\n{e.stderr.strip()}")
        sys.exit(1)

def generate_random_message(length=12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def git_add():
    print("Adding changes...")
    run_command(["git", "add", "."], "Failed to add files")

def git_commit(message):
    print(f"Committing with message: {message}")
    run_command(["git", "commit", "-m", message], "Failed to commit changes")

def git_push(branch="main"):
    print(f"Pushing to {branch}...")
    run_command(["git", "push", "origin", branch], "Failed to push changes")

def main():
    if not os.path.exists(".git"):
        print("❌ This is not a Git repository.")
        sys.exit(1)

    commit_message = generate_random_message()
    branch = "main"  # You can make this dynamic if needed

    git_add()
    git_commit(commit_message)
    git_push(branch)
    print("✅ Done!")

if __name__ == "__main__":
    main()
