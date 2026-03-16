import tkinter as tk
import subprocess
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(sys.argv[0]))
EXE = os.path.join(BASE_DIR, "ApportionmentSys.exe")

def run_command():
    seats = seats_var.get().strip()
    csv_file = csv_var.get().strip()

    if not seats:
        status_label.config(text="Enter a seat count.", fg="#ff5f5f")
        return
    if not csv_file:
        status_label.config(text="Select a CSV file.", fg="#ff5f5f")
        return

    csv_path = os.path.join(BASE_DIR, csv_file)
    if not os.path.exists(csv_path):
        status_label.config(text=f"CSV not found: {csv_file}", fg="#ff5f5f")
        return

    status_label.config(text="Running...", fg="#f5c842")
    root.update()

    try:
        result = subprocess.run(
            [EXE, "--seats", seats, csv_path],
            capture_output=True,
            text=True,
            cwd=BASE_DIR
        )
        output = result.stdout if result.stdout else result.stderr
        output_text.config(state="normal")
        output_text.delete(1.0, tk.END)
        output_text.insert(tk.END, output)
        output_text.config(state="disabled")
        status_label.config(text="Done. Results encrypted and saved.", fg="#3ecf8e")
    except Exception as e:
        status_label.config(text=f"Error: {e}", fg="#ff5f5f")

root = tk.Tk()
root.title("Secure Apportionment System v0.1.0")
root.geometry("640x520")
root.configure(bg="#0d0f14")
root.resizable(False, False)

tk.Label(root, text="SECURE APPORTIONMENT SYSTEM",
         bg="#0d0f14", fg="#4f9eff",
         font=("Courier", 13, "bold")).pack(pady=18)

tk.Label(root, text="Huntington-Hill · AES-256-CBC · v0.1.0",
         bg="#0d0f14", fg="#555e75",
         font=("Courier", 8)).pack()

tk.Frame(root, bg="#252a38", height=1).pack(fill="x", padx=30, pady=14)

frame = tk.Frame(root, bg="#0d0f14")
frame.pack(padx=30, fill="x")

tk.Label(frame, text="Total Seats:", bg="#0d0f14", fg="#8892aa",
         font=("Courier", 10)).grid(row=0, column=0, sticky="w", pady=8)
seats_var = tk.StringVar(value="100")
tk.Entry(frame, textvariable=seats_var, bg="#13161e", fg="#e8ecf4",
         font=("Courier", 11), insertbackground="#4f9eff",
         relief="flat", width=10,
         highlightbackground="#252a38",
         highlightthickness=1).grid(row=0, column=1, sticky="w", padx=12)

tk.Label(frame, text="CSV Dataset:", bg="#0d0f14", fg="#8892aa",
         font=("Courier", 10)).grid(row=1, column=0, sticky="w", pady=8)
csv_var = tk.StringVar(value="sample_basic.csv")
csv_menu = tk.OptionMenu(frame, csv_var,
    "sample_basic.csv",
    "sample_alabama_paradox.csv",
    "sample_arrow.csv",
    "sample_coalition.csv",
    "sample_condorcet.csv",
    "sample_large_election.csv",
    "sample_proportional.csv",
    "sample_runoff_round1.csv",
    "sample_runoff_round2.csv",
    "sample_strategic_voting.csv",
    "sample_strategic_voting_no_green.csv")
csv_menu.config(bg="#13161e", fg="#e8ecf4",
                font=("Courier", 10), width=32,
                relief="flat", activebackground="#1a1e28",
                activeforeground="#4f9eff")
csv_menu["menu"].config(bg="#13161e", fg="#e8ecf4", font=("Courier", 9))
csv_menu.grid(row=1, column=1, sticky="w", padx=12)

tk.Frame(root, bg="#252a38", height=1).pack(fill="x", padx=30, pady=14)

tk.Button(root, text="  Calculate Allocation  →  ",
          command=run_command,
          bg="#4f9eff", fg="#0d0f14",
          font=("Courier", 11, "bold"),
          relief="flat", padx=16, pady=10,
          cursor="hand2",
          activebackground="#7b61ff",
          activeforeground="white").pack()

status_label = tk.Label(root, text="Select a dataset and click Calculate.",
                        bg="#0d0f14", fg="#555e75",
                        font=("Courier", 9))
status_label.pack(pady=8)

tk.Frame(root, bg="#252a38", height=1).pack(fill="x", padx=30)

output_text = tk.Text(root, bg="#13161e", fg="#3ecf8e",
                      font=("Courier", 9), height=10,
                      relief="flat", padx=14, pady=10,
                      state="disabled",
                      highlightbackground="#252a38",
                      highlightthickness=1)
output_text.pack(padx=30, fill="both", expand=True, pady=10)

root.mainloop()
