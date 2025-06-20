import json

with open('tf_outputs.json') as f:
    data = json.load(f)

frontend_ip = data['frontend_vm_public_ip']['value']
backend_ip = data['backend_vm_public_ip']['value']
backend_private_ip = data['backend_vm_private_ip']['value']

# Write inventory.ini
with open('inventory.ini', 'w') as inv:
    inv.write(f"""[frontend]
frontend ansible_host={frontend_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/pubment.pem

[backend]
backend ansible_host={backend_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/pubment.pem ansible_ssh_common_args='-o ProxyJump=ubuntu@{frontend_ip}'
""")

# Write frontend_vars.yml
with open('frontend_vars.yml', 'w') as varsfile:
    varsfile.write(f"""backend_private_ip: "{backend_private_ip}"
""")
