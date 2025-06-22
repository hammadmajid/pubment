import json

with open('../ansible/tf_outputs.json') as f:
    data = json.load(f)

backend_ip = data['backend_vm_public_ip']['value']

# Write inventory.ini
with open('../ansible/inventory.ini', 'w') as inv:
    inv.write(f"""[backend]
backend ansible_host={backend_ip} ansible_user=azureuser ansible_ssh_private_key_file=~/.ssh/pubment.pem'
""")
