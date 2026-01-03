print("🔍 Testing model loader...")

try:
    import services.model_loader as ml

    print("\n✅ Pre-lime assets:")
    for key, obj in ml.pre_lime_assets.items():
        print(f"  - {key}: {type(obj)}")

    print("\n✅ Post-lime assets:")
    for key, obj in ml.post_lime_assets.items():
        print(f"  - {key}: {type(obj)}")

    print("\n🎉 All model assets loaded successfully!")

except FileNotFoundError as e:
    print("❌ File not found error")
    print(e)

except Exception as e:
    print("❌ Unexpected error while loading models")
    print(type(e).__name__, e)
