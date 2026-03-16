import tkinter as tk
import subprocess
import os
import sys

def run_command():
    seats = seats_var.get()
    csv_file = csv_var.get()
    if not seats or not csv_file:
        status_label.config(text="Please fill in both fields.", fg="#ff5f5f")
        return
    exe = os.path.join(os.path.dirname(sys.executable), "ApportionmentSys.exe")
    if not os.path.exists(exe):
        exe = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ApportionmentSys.exe")
    cmd = [exe, "--seats", seats, csv_file]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=os.path.dirname(exe))
    output_text.delete(1.0, tk.END)
    output_text.insert(tk.END, result.stdout if result.stdout else result.stderr)
    status_label.config(text="Done.", fg="#3ecf8e")

root = tk.Tk()
root.title("Secure Apportionment System v0.1.0")
root.geometry("600x500")
root.configure(bg="#0d0f14")
root.resizable(False, False)

tk.Label(root, text="SECURE APPORTIONMENT SYSTEM", bg="#0d0f14", fg="#4f9eff",
         font=("Courier", 12, "bold")).pack(pady=20)

frame = tk.Frame(root, bg="#0d0f14")
frame.pack(padx=30, fill="x")

tk.Label(frame, text="Total Seats:", bg="#0d0f14", fg="#8892aa",
         font=("Courier", 10)).grid(row=0, column=0, sticky="w", pady=6)
seats_var = tk.StringVar(value="100")
tk.Entry(frame, textvariable=seats_var, bg="#13161e", fg="#e8ecf4",
         font=("Courier", 10), insertbackground="white", width=10).grid(row=0, column=1, sticky="w", padx=10)

tk.Label(frame, text="CSV File:", bg="#0d0f14", fg="#8892aa",
         font=("Courier", 10)).grid(row=1, column=0, sticky="w", pady=6)
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
csv_menu.config(bg="#13161e", fg="#e8ecf4", font=("Courier", 10), width=30)
csv_menu.grid(row=1, column=1, sticky="w", padx=10)

tk.Button(root, text="Calculate Allocation →", command=run_command,
          bg="#4f9eff", fg="white", font=("Courier", 11, "bold"),
          relief="flat", padx=20, pady=8, cursor="hand2").pack(pady=20)

status_label = tk.Label(root, text="", bg="#0d0f14", fg="#3ecf8e", font=("Courier", 9))
status_label.pack()

output_text = tk.Text(root, bg="#13161e", fg="#e8ecf4", font=("Courier", 9),
                      height=12, relief="flat", padx=10, pady=10)
output_text.pack(padx=30, fill="both", expand=True, pady=10)

root.mainloop()
